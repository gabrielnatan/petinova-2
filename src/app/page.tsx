"use client";
import React, { useEffect, useState } from "react";
import {
  Heart,
  Calendar,
  Users,
  Package,
  ArrowRight,
  Play,
  Check,
  Star,
  Shield,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  Award,
  TrendingUp,
  Clock,
  UserCheck,
  Zap,
  Target,
  Globe,
  Smartphone,
  Database,
  Lock,
  MessageCircle,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";

// Header Component
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Petinova
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { name: "Recursos", href: "#recursos" },
              { name: "Preços", href: "#precos" },
              { name: "Cases", href: "#cases" },
              { name: "Contato", href: "#contato" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/auth/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Entrar
            </a>
            <a
              href="/auth/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Começar Grátis
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {[
                { name: "Recursos", href: "#recursos" },
                { name: "Preços", href: "#precos" },
                { name: "Cases", href: "#cases" },
                { name: "Contato", href: "#contato" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <a
                  href="/auth/login"
                  className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 mb-3"
                >
                  Entrar
                </a>
                <a
                  href="/auth/register"
                  className="block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-center hover:shadow-lg transition-all duration-300"
                >
                  Começar Grátis
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Sistema mais moderno do mercado
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Gestão Veterinária
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Simplificada
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Transforme sua clínica veterinária com o sistema mais intuitivo e completo. 
                Gerencie tudo em um só lugar: agendamentos, prontuários, estoque e financeiro.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/auth/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <span>Começar Grátis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <button className="group bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-white hover:shadow-lg transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>Ver Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              {[
                { value: "500+", label: "Clínicas Ativas" },
                { value: "50k+", label: "Pets Cadastrados" },
                { value: "99.9%", label: "Uptime Garantido" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    {
                      icon: Calendar,
                      value: "24",
                      label: "Consultas Hoje",
                      color: "blue",
                    },
                    {
                      icon: Heart,
                      value: "156",
                      label: "Pets Ativos",
                      color: "purple",
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-6">
                      <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-medium text-gray-900">Faturamento Mensal</span>
                    <span className="text-green-600 text-sm font-medium">+12.5%</span>
                  </div>
                  <div className="flex items-end space-x-2 h-24">
                    {[40, 65, 35, 80, 55, 70, 90].map((height, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t flex-1"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 z-20 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Nova consulta</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 z-20 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">+15% receita</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema automático com confirmações por WhatsApp e lembretes personalizados.",
      color: "blue",
      highlight: "98% comparecimento",
    },
    {
      icon: FileText,
      title: "Prontuário Digital",
      description: "Histórico completo com fotos, exames e tratamentos em um só lugar.",
      color: "purple",
      highlight: "Histórico completo",
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Gestão automática com alertas de vencimento e estoque baixo.",
      color: "green",
      highlight: "Zero desperdício",
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboard com métricas em tempo real e insights financeiros.",
      color: "orange",
      highlight: "Insights em tempo real",
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description: "Controle de acesso por perfil e agenda compartilhada.",
      color: "pink",
      highlight: "Equipe conectada",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia e backup automático.",
      color: "indigo",
      highlight: "100% seguro",
    },
  ];

  return (
    <section className="py-24 bg-white" id="recursos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
            Tudo que sua clínica
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              precisa em um só lugar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubra como milhares de veterinários estão revolucionando suas clínicas 
            com nossa plataforma completa e intuitiva.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl hover:border-blue-200 transition-all duration-500"
            >
              <div className={`w-16 h-16 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <div className={`inline-flex items-center text-${feature.color}-600 font-medium group-hover:text-${feature.color}-700`}>
                <span>{feature.highlight}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-${feature.color}-500/5 to-${feature.color}-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Trusted By Section
function TrustedBySection() {
  const companies = [
    { name: "VetMais", logo: "🏥" },
    { name: "PetCenter", logo: "🐕" },
    { name: "AnimalCare", logo: "🐱" },
    { name: "VetSaúde", logo: "🩺" },
    { name: "PetLife", logo: "❤️" },
    { name: "VetClinic", logo: "🏥" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 mb-12 text-lg">
            Confiado por mais de 500 clínicas veterinárias
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 items-center">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex flex-col items-center space-y-3 group cursor-pointer"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {company.logo}
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "97",
      period: "mês",
      description: "Perfeito para clínicas pequenas",
      features: [
        "Até 100 pets cadastrados",
        "Agendamento básico",
        "Prontuário eletrônico",
        "Controle de estoque",
        "Relatórios básicos",
        "Suporte por email",
      ],
      popular: false,
      color: "gray",
    },
    {
      name: "Professional",
      price: "197",
      period: "mês",
      description: "Ideal para clínicas em crescimento",
      features: [
        "Pets ilimitados",
        "Agendamento avançado",
        "Prontuário completo",
        "Gestão financeira",
        "Relatórios avançados",
        "WhatsApp integrado",
        "Múltiplos usuários",
        "Suporte prioritário",
      ],
      popular: true,
      color: "blue",
    },
    {
      name: "Enterprise",
      price: "397",
      period: "mês",
      description: "Para grandes clínicas e redes",
      features: [
        "Tudo do Professional",
        "Múltiplas unidades",
        "API personalizada",
        "Integrações avançadas",
        "Dashboard executivo",
        "Backup dedicado",
        "Suporte 24/7",
        "Treinamento incluso",
      ],
      popular: false,
      color: "purple",
    },
  ];

  return (
    <section className="py-24 bg-white" id="precos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
            Planos que se adaptam
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ao seu crescimento
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Escolha o plano ideal para sua clínica. Todos incluem 30 dias grátis 
            e podem ser cancelados a qualquer momento.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white border rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-blue-500 shadow-2xl scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    R$ {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <a
                  href="/auth/register"
                  className={`inline-block px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Começar Teste Grátis
                </a>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.popular ? "text-blue-600" : "text-gray-600"
                      }`} />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Precisa de um plano personalizado?
          </p>
          <Link
            href="#contato"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-2"
          >
            <span>Fale com nosso time</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Ana Paula Silva",
      role: "Veterinária | Clínica VetCare",
      image: "👩‍⚕️",
      content: "O Petinova revolucionou nossa clínica! Conseguimos reduzir em 40% o tempo de agendamentos e nossos clientes adoram as confirmações automáticas.",
      rating: 5,
      stats: "40% menos tempo",
    },
    {
      name: "Dr. Carlos Mendes",
      role: "Diretor | Rede PetSaúde",
      image: "👨‍⚕️",
      content: "Com 3 unidades, precisávamos de um sistema integrado. O dashboard executivo nos dá visão completa do negócio em tempo real.",
      rating: 5,
      stats: "+30% receita",
    },
    {
      name: "Dra. Marina Costa",
      role: "Veterinária | PetLife Clínica",
      image: "👩‍⚕️",
      content: "A gestão de estoque automática evita que medicamentos vençam. O sistema nos avisa quando algo está acabando.",
      rating: 5,
      stats: "R$ 10k economizados",
    },
  ];

  return (
    <section className="py-24 bg-gray-50" id="cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
            Veterinários que confiam
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              na Petinova
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubra como centenas de veterinários estão transformando suas clínicas 
            e alcançando resultados extraordinários.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Rating */}
              <div className="flex space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Stats Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2 mb-6">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">
                  {testimonial.stats}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-16 border-t border-gray-200">
          {[
            { value: "500+", label: "Clínicas Ativas" },
            { value: "50k+", label: "Pets Cadastrados" },
            { value: "98%", label: "Taxa de Satisfação" },
            { value: "24/7", label: "Suporte Disponível" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {[
          { left: "10%", top: "20%" },
          { left: "80%", top: "10%" },
          { left: "20%", top: "80%" },
          { left: "90%", top: "70%" },
          { left: "50%", top: "30%" },
          { left: "70%", top: "90%" },
        ].map((position, i) => (
          <div
            key={i}
            className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl"
            style={{
              left: position.left,
              top: position.top,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          Pronto para revolucionar
          <br />
          sua clínica veterinária?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Junte-se a centenas de veterinários que já transformaram suas clínicas 
          com a Petinova. Comece gratuitamente hoje mesmo!
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <a
            href="/auth/register"
            className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 hover:shadow-2xl transition-all duration-300"
          >
            <span>Começar Teste Grátis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
          <button className="group text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 hover:bg-white/10 transition-all duration-300">
            <Play className="w-5 h-5" />
            <span>Agendar Demo</span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-white/80">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">30 dias grátis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span className="font-medium">Sem compromisso</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Setup em 5 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const footerLinks = {
    Produto: [
      { name: "Recursos", href: "#recursos" },
      { name: "Preços", href: "#precos" },
      { name: "Demo", href: "#demo" },
      { name: "Atualizações", href: "#atualizacoes" },
    ],
    Empresa: [
      { name: "Sobre nós", href: "#sobre" },
      { name: "Carreiras", href: "#carreiras" },
      { name: "Blog", href: "#blog" },
      { name: "Imprensa", href: "#imprensa" },
    ],
    Suporte: [
      { name: "Central de Ajuda", href: "#ajuda" },
      { name: "Contato", href: "#contato" },
      { name: "Status", href: "#status" },
      { name: "API", href: "#api" },
    ],
    Legal: [
      { name: "Privacidade", href: "#privacidade" },
      { name: "Termos", href: "#termos" },
      { name: "LGPD", href: "#lgpd" },
      { name: "Cookies", href: "#cookies" },
    ],
  };

  const socialLinks = [
    { name: "LinkedIn", icon: "💼", href: "#" },
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "Instagram", icon: "📸", href: "#" },
    { name: "YouTube", icon: "📺", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white" id="contato">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold">Petinova</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Revolucionando a gestão veterinária com tecnologia de ponta. 
              Junte-se a centenas de clínicas que já transformaram seus resultados.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-gray-400">
                Receba dicas exclusivas e atualizações sobre gestão veterinária.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                Inscrever
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2025 Petinova. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>🇧🇷 Feito no Brasil</span>
            <span>•</span>
            <span>🔒 Dados protegidos</span>
            <span>•</span>
            <span>⚡ 99.9% uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TrustedBySection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
