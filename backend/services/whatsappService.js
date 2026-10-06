const axios = require('axios');

class WhatsAppService {
  constructor(config) {
    this.config = config;
    this.provider = config.provider || 'meta';
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.apiVersion = config.apiVersion || 'v18.0';
    
    // Base URL based on provider
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    switch (this.provider) {
      case 'meta':
        return `https://graph.facebook.com/${this.apiVersion}`;
      case 'twilio':
        return 'https://api.twilio.com/2010-04-01';
      case '360dialog':
        return 'https://waba.360dialog.io/v1';
      case 'messagebird':
        return 'https://conversations.messagebird.com/v1';
      case 'infobip':
        return 'https://api.infobip.com';
      default:
        return `https://graph.facebook.com/${this.apiVersion}`;
    }
  }

  // Get headers for API requests
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Send text message
  async sendMessage(to, message, options = {}) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: options.previewUrl || false,
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  // Send template message
  async sendTemplate(to, templateName, languageCode = 'en', components = []) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp template sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp template:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp template');
    }
  }

  // Send media message (image, video, document, audio)
  async sendMedia(to, mediaType, mediaUrl, caption = '', filename = '') {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const mediaObject = {
        link: mediaUrl
      };

      if (caption && (mediaType === 'image' || mediaType === 'video')) {
        mediaObject.caption = caption;
      }

      if (filename && mediaType === 'document') {
        mediaObject.filename = filename;
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: mediaType,
        [mediaType]: mediaObject
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp ${mediaType} sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp media:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp media');
    }
  }

  // Send location
  async sendLocation(to, latitude, longitude, name = '', address = '') {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'location',
        location: {
          latitude: latitude,
          longitude: longitude,
          name: name,
          address: address
        }
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp location sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp location:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp location');
    }
  }

  // Send interactive message (buttons, list)
  async sendInteractive(to, interactiveType, body, action) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: interactiveType, // 'button' or 'list'
          body: {
            text: body
          },
          action: action
        }
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp interactive message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp interactive message:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp interactive message');
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log(`WhatsApp message ${messageId} marked as read`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error.response?.data || error.message);
      throw new Error('Failed to mark message as read');
    }
  }

  // Get media URL
  async getMediaUrl(mediaId) {
    try {
      const url = `${this.baseUrl}/${mediaId}`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      return response.data.url;
    } catch (error) {
      console.error('Error getting media URL:', error.response?.data || error.message);
      throw new Error('Failed to get media URL');
    }
  }

  // Download media
  async downloadMedia(mediaUrl) {
    try {
      const response = await axios.get(mediaUrl, {
        headers: this.getHeaders(),
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading media:', error.response?.data || error.message);
      throw new Error('Failed to download media');
    }
  }

  // Get business profile
  async getBusinessProfile() {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/whatsapp_business_profile`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          fields: 'about,address,description,email,profile_picture_url,websites,vertical'
        }
      });

      return response.data.data[0];
    } catch (error) {
      console.error('Error getting business profile:', error.response?.data || error.message);
      throw new Error('Failed to get business profile');
    }
  }

  // Update business profile
  async updateBusinessProfile(profileData) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/whatsapp_business_profile`;
      
      const payload = {
        messaging_product: 'whatsapp',
        ...profileData
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      console.log('WhatsApp business profile updated');
      return response.data;
    } catch (error) {
      console.error('Error updating business profile:', error.response?.data || error.message);
      throw new Error('Failed to update business profile');
    }
  }

  // Get phone number info
  async getPhoneNumberInfo() {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          fields: 'verified_name,display_phone_number,quality_rating'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting phone number info:', error.response?.data || error.message);
      throw new Error('Failed to get phone number info');
    }
  }

  // Verify webhook
  verifyWebhook(mode, token, challenge) {
    const verifyToken = this.config.webhookVerifyToken;
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WhatsApp webhook verified');
      return challenge;
    } else {
      console.error('WhatsApp webhook verification failed');
      return null;
    }
  }

  // Parse webhook payload
  parseWebhookPayload(payload) {
    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        return null;
      }

      // Handle different webhook types
      if (value.messages) {
        return {
          type: 'message',
          data: this.parseMessage(value)
        };
      } else if (value.statuses) {
        return {
          type: 'status',
          data: this.parseStatus(value)
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return null;
    }
  }

  // Parse incoming message
  parseMessage(value) {
    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const metadata = value.metadata;

    return {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text?.body,
      image: message.image,
      video: message.video,
      audio: message.audio,
      document: message.document,
      location: message.location,
      contacts: message.contacts,
      interactive: message.interactive,
      button: message.button,
      context: message.context,
      contactName: contact?.profile?.name,
      phoneNumberId: metadata.phone_number_id,
      displayPhoneNumber: metadata.display_phone_number
    };
  }

  // Parse status update
  parseStatus(value) {
    const status = value.statuses[0];

    return {
      messageId: status.id,
      status: status.status, // sent, delivered, read, failed
      timestamp: status.timestamp,
      recipientId: status.recipient_id,
      errors: status.errors
    };
  }

  // Test connection
  async testConnection() {
    try {
      const phoneInfo = await this.getPhoneNumberInfo();
      return {
        success: true,
        message: 'WhatsApp connection successful',
        data: phoneInfo
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = WhatsAppService;
