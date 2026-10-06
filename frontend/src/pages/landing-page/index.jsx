import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import {
  MessageSquare,
  Bot,
  BarChart2,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  Star,
  X,
  Check,
  Truck,
  FileText,
  CreditCard,
  Calendar
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-300">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">OmniChat</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Fitur</a>
              <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Solusi</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Harga</a>
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Masuk
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-200/50 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Konsultasi Gratis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left Content */}
            <div className="lg:w-1/2 text-left relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                <span className="text-sm font-semibold tracking-wide uppercase">AI Agent No. 1 di Indonesia</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.15]">
                Ubah Chat Jadi <span className="text-emerald-600">Closing</span> dengan AI yang Paham Bisnis Indonesia
              </h1>
              <p className="text-base md:text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                Dari cek ongkir, kirim invoice, sampai terima pembayaran—semua otomatis 24/7. Biarkan AI kami yang handle, Anda fokus ke strategi bisnis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-200/50 hover:translate-y-[-2px] transition-all duration-300 w-full sm:w-auto flex items-center justify-center group"
                >
                  Konsultasi dengan Kami
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="h-14 px-8 text-lg bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-600 rounded-full w-full sm:w-auto"
                >
                  Coba Gratis
                </Button>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-4">Dipercaya oleh brand terdepan</p>
                <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {/* Placeholder Logos */}
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Right Animation - Conversion Demo */}
            <div className="lg:w-1/2 w-full relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>

              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-w-md mx-auto lg:mr-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">OmniChat AI</h3>
                      <p className="text-xs text-emerald-600 flex items-center font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Online
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="space-y-5 mb-6">
                  <div className="flex items-start">
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 max-w-[85%]">
                      Halo! Mau cek ongkir ke Jakarta Selatan berapa ya kak?
                    </div>
                  </div>

                  <div className="flex items-start justify-end">
                    <div className="bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                      Untuk pengiriman Reguler Rp 10.000, Next Day Rp 18.000 kak. Mau sekalian dibuatkan ordernya?
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 max-w-[85%]">
                      Boleh kak, yang Reguler aja ya.
                    </div>
                  </div>

                  {/* Action Card */}
                  <div className="mx-10 bg-white border border-emerald-100 rounded-xl p-4 shadow-lg animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Invoice Dibuat</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">UNPAID</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-1">Rp 160.000</div>
                    <div className="text-xs text-slate-500 mb-3">Order #INV-2024001</div>
                    <button className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "6.5M+", label: "Percakapan Otomatis" },
              { value: "+42%", label: "Kenaikan Penjualan" },
              { value: "96%", label: "Preferensi Pelanggan" },
              { value: "20x", label: "Lebih Hemat Biaya" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Bukan Sekedar Chatbot Biasa</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Lihat mengapa OmniChat AI jauh lebih unggul dibandingkan chatbot tradisional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Chatbot */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Chatbot Tradisional</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Kaku & Robotik",
                  "Mudah error jika pertanyaan kompleks",
                  "Hanya bisa memberikan informasi dasar",
                  "Tidak bisa mengambil tindakan nyata"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-slate-600">
                    <X className="w-5 h-5 text-slate-400 mr-3 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* OmniChat AI */}
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                RECOMMENDED
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">OmniChat AI Agent</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Percakapan natural & manusiawi",
                  "Paham konteks & empati",
                  "Bisa negosiasi & upsell produk",
                  "Bisa ambil tindakan (Invoice, Cek Ongkir, Booking)"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-slate-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Features Grid */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Bisa Melakukan Pekerjaan Nyata</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              AI kami didesain untuk menyelesaikan tugas, bukan hanya menjawab chat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <CheckCircle2 className="w-6 h-6 text-white" />,
                color: "bg-blue-500",
                title: "Tutup Penjualan",
                desc: "Mengarahkan pelanggan dari tanya-jawab hingga deal transaksi."
              },
              {
                icon: <FileText className="w-6 h-6 text-white" />,
                color: "bg-purple-500",
                title: "Kirim Invoice",
                desc: "Membuat dan mengirim invoice profesional secara otomatis."
              },
              {
                icon: <Truck className="w-6 h-6 text-white" />,
                color: "bg-orange-500",
                title: "Cek Ongkir",
                desc: "Hitung ongkos kirim real-time JNE, J&T, SiCepat, dll."
              },
              {
                icon: <CreditCard className="w-6 h-6 text-white" />,
                color: "bg-emerald-500",
                title: "Terima Pembayaran",
                desc: "Verifikasi pembayaran otomatis via QRIS & Virtual Account."
              },
              {
                icon: <Calendar className="w-6 h-6 text-white" />,
                color: "bg-pink-500",
                title: "Booking Jadwal",
                desc: "Atur janji temu atau reservasi tanpa bentrok jadwal."
              },
              {
                icon: <Shield className="w-6 h-6 text-white" />,
                color: "bg-indigo-500",
                title: "Handle Komplain",
                desc: "Selesaikan keluhan pelanggan dengan empati dan solusi cepat."
              },
              {
                icon: <BarChart2 className="w-6 h-6 text-white" />,
                color: "bg-cyan-500",
                title: "Kualifikasi Leads",
                desc: "Filter calon pelanggan potensial secara otomatis."
              },
              {
                icon: <Globe className="w-6 h-6 text-white" />,
                color: "bg-rose-500",
                title: "Integrasi CRM",
                desc: "Update data pelanggan ke CRM Anda secara real-time."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Terintegrasi dengan Tools Favorit Anda</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Text Placeholders for Logos */}
            <span className="text-xl font-bold text-slate-600">WhatsApp</span>
            <span className="text-xl font-bold text-slate-600">Telegram</span>
            <span className="text-xl font-bold text-slate-600">Instagram</span>
            <span className="text-xl font-bold text-slate-600">Shopify</span>
            <span className="text-xl font-bold text-slate-600">WooCommerce</span>
            <span className="text-xl font-bold text-slate-600">Google Ads</span>
            <span className="text-xl font-bold text-slate-600">Meta Ads</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Siap untuk Revolusi Bisnis Anda?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan bisnis yang telah beralih ke OmniChat AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/login')}
              className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              Mulai Sekarang Gratis
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="h-14 px-8 text-lg bg-transparent border border-slate-700 text-white hover:bg-slate-800 rounded-full"
            >
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-2">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">OmniChat</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Hubungi Kami</a>
          </div>
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} OmniChat Indonesia.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
