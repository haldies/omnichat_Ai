const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../prisma/generated/client');
const { supabaseAuth, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @route   GET /api/team/members
 * @desc    Get all team members
 * @access  Private (Admin, Manager)
 */
router.get('/members', supabaseAuth, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // Build filter - only show users from same business
    const where = {
      businessId: req.user.businessId
    };
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
        business: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            assignedConversations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team members'
    });
  }
});

/**
 * @route   GET /api/team/members/:id
 * @desc    Get team member by ID
 * @access  Private
 */
router.get('/members/:id', supabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            assignedConversations: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team member'
    });
  }
});

/**
 * @route   POST /api/team/members
 * @desc    Create new team member
 * @access  Private (Admin only)
 */
router.post('/members', supabaseAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, name, role = 'agent' } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        businessId: req.user.businessId,
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('team:member_added', { member: user });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team member'
    });
  }
});

/**
 * @route   PUT /api/team/members/:id
 * @desc    Update team member
 * @access  Private (Admin, Manager, or self)
 */
router.put('/members/:id', supabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, avatar } = req.body;

    // Check if user can update
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isSelf = req.user.id === id;

    if (!isAdmin && !isManager && !isSelf) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Build update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    // Only admin can change role and status
    if (isAdmin) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('team:member_updated', { member: user });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member'
    });
  }
});

/**
 * @route   DELETE /api/team/members/:id
 * @desc    Delete team member
 * @access  Private (Admin only)
 */
router.delete('/members/:id', supabaseAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting self
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete yourself'
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('team:member_deleted', { memberId: id });

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team member'
    });
  }
});

/**
 * @route   GET /api/team/stats
 * @desc    Get team statistics
 * @access  Private (Admin, Manager)
 */
router.get('/stats', supabaseAuth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const businessId = req.user.businessId;

    // Get user counts by role (filtered by business)
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: {
        businessId: businessId
      },
      _count: true
    });

    // Get user counts by status (filtered by business)
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      where: {
        businessId: businessId
      },
      _count: true
    });

    // Get active users (logged in last 24 hours, filtered by business)
    const activeUsers = await prisma.user.count({
      where: {
        businessId: businessId,
        lastLogin: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get total users (filtered by business)
    const totalUsers = await prisma.user.count({
      where: {
        businessId: businessId
      }
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {}),
        byStatus: usersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team stats'
    });
  }
});

/**
 * @route   GET /api/team/roles
 * @desc    Get available roles
 * @access  Private
 */
router.get('/roles', supabaseAuth, async (req, res) => {
  try {
    const roles = [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'manager', label: 'Manager', description: 'Manage team and conversations' },
      { value: 'agent', label: 'Agent', description: 'Handle customer conversations' },
      { value: 'viewer', label: 'Viewer', description: 'View-only access' }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get roles'
    });
  }
});

module.exports = router;
