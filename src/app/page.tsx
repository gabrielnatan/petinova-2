"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";

// Componente do Header
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Petinova</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {["Recursos", "Preços", "Cases", "Contato"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="/auth/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Entrar
            </motion.a>
            <motion.a
              href="/auth/register"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              Começar Grátis
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
                {["Recursos", "Preços", "Cases", "Contato"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="pt-4 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center py-2 text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full text-center py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
                  >
                    Começar Grátis
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

// Componente Hero Section
function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden"
      style={{ y, opacity }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  Gestão Veterinária
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Gestão Veterinária
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Inteligente
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Transforme sua clínica veterinária com o sistema mais moderno e
                intuitivo do mercado. Gerencie agendamentos, consultas e estoque
                em um só lugar.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.a
                href="/auth/register"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Começar Grátis</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.a>

              <motion.button
                className="group bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-white hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                <span>Ver Demo</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {[
                { value: "500+", label: "Clínicas" },
                { value: "50k+", label: "Pets" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              {/* Main Dashboard Card */}
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 relative z-10"
                whileHover={{ y: -10, rotateY: 5 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      Dashboard
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                    <motion.div
                      key={item.label}
                      className="bg-gray-50 rounded-xl p-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div
                        className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-3`}
                      >
                        <item.icon
                          className={`w-4 h-4 text-${item.color}-600`}
                        />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-900">
                      Faturamento
                    </span>
                    <span className="text-green-600 text-sm font-medium">
                      +12.5%
                    </span>
                  </div>
                  <div className="flex items-end space-x-2 h-20">
                    {[40, 65, 35, 80, 55, 70, 90].map((height, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t flex-1"
                        style={{ height: `${height}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.1 + 1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Nova consulta agendada
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Receita +15%</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-gray-400" />
      </motion.div>
    </motion.section>
  );
}

// Componente Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description:
        "Sistema de agendamento automático com confirmações por WhatsApp e lembretes personalizados.",
      color: "blue",
      stats: "98% de comparecimento",
    },
    {
      icon: Heart,
      title: "Gestão de Pets",
      description:
        "Prontuário eletrônico completo com histórico médico, vacinas e acompanhamento de tratamentos.",
      color: "purple",
      stats: "Histórico completo",
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description:
        "Gestão automática de medicamentos e produtos com alertas de vencimento e estoque baixo.",
      color: "green",
      stats: "Zero desperdício",
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description:
        "Dashboard com métricas em tempo real e relatórios financeiros detalhados para sua clínica.",
      color: "orange",
      stats: "Insights em tempo real",
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description:
        "Controle de acesso por perfil, agenda compartilhada e gestão de veterinários e funcionários.",
      color: "pink",
      stats: "Equipe conectada",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description:
        "Dados protegidos com criptografia de ponta, backup automático e conformidade com LGPD.",
      color: "indigo",
      stats: "100% seguro",
    },
  ];

  return (
    <section className="py-20 bg-white" id="recursos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tudo que sua clínica
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              precisa em um só lugar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como milhares de veterinários estão revolucionando suas
            clínicas com nossa plataforma completa de gestão.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div
                className={`w-14 h-14 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>

              <div
                className={`inline-flex items-center text-${feature.color}-600 font-medium group-hover:text-${feature.color}-700`}
              >
                <span>{feature.stats}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-${feature.color}-500/5 to-${feature.color}-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente Trusted By Section
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-8">
            Confiado por mais de 500 clínicas veterinárias
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                className="flex flex-col items-center space-y-2 group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {company.logo}
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Componente Pricing Section
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
    <section className="py-20 bg-white" id="preços">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Planos que se adaptam
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ao seu crescimento
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para sua clínica. Todos incluem 30 dias grátis
            e podem ser cancelados a qualquer momento.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-white border-2 rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-blue-500 shadow-2xl scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: plan.popular ? 0 : -5 }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                </motion.div>
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

                <motion.a
                  href="/auth/register"
                  className={`block w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Começar Teste Grátis
                </motion.a>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            Precisa de um plano personalizado?
          </p>
          <Link
            href="#contato"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1"
          >
            <span>Fale com nosso time</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Componente Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Ana Paula Silva",
      role: "Veterinária | Clínica VetCare",
      image: "👩‍⚕️",
      content:
        "O Petinova revolucionou nossa clínica! Conseguimos reduzir em 40% o tempo de agendamentos e nossos clientes adoram as confirmações automáticas por WhatsApp.",
      rating: 5,
      stats: "40% menos tempo",
    },
    {
      name: "Dr. Carlos Mendes",
      role: "Diretor | Rede PetSaúde",
      image: "👨‍⚕️",
      content:
        "Com 3 unidades, precisávamos de um sistema integrado. O dashboard executivo nos dá visão completa do negócio em tempo real. Aumentamos nossa receita em 30%.",
      rating: 5,
      stats: "+30% receita",
    },
    {
      name: "Dra. Marina Costa",
      role: "Veterinária | PetLife Clínica",
      image: "👩‍⚕️",
      content:
        "A gestão de estoque automática evita que medicamentos vençam. O sistema nos avisa quando algo está acabando. Já economizamos mais de R$ 10.000 em desperdícios.",
      rating: 5,
      stats: "R$ 10k economizados",
    },
    {
      name: "Dr. Roberto Lima",
      role: "Veterinário | AnimalCare",
      image: "👨‍⚕️",
      content:
        "O prontuário eletrônico é fantástico! Tenho todo o histórico do pet na palma da mão. Meus diagnósticos ficaram mais precisos e os clientes confiam mais no trabalho.",
      rating: 5,
      stats: "Diagnósticos precisos",
    },
    {
      name: "Dra. Juliana Santos",
      role: "Diretora | PetCenter",
      image: "👩‍⚕️",
      content:
        "Implementamos o Petinova há 6 meses e os resultados são impressionantes. Nossa taxa de agendamentos perdidos caiu para quase zero. Recomendo para qualquer clínica!",
      rating: 5,
      stats: "Zero agendamentos perdidos",
    },
    {
      name: "Dr. Felipe Oliveira",
      role: "Veterinário | VetMais",
      image: "👨‍⚕️",
      content:
        "O suporte é excepcional e a plataforma é muito intuitiva. Minha equipe aprendeu a usar em poucos dias. Definitivamente o melhor investimento que fizemos na clínica.",
      rating: 5,
      stats: "Aprendizado rápido",
    },
  ];

  return (
    <section className="py-20 bg-gray-50" id="cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Veterinários que confiam
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              na Petinova
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como centenas de veterinários estão transformando suas
            clínicas e alcançando resultados extraordinários.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Rating */}
              <div className="flex space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Stats Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 mb-6">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">
                  {testimonial.stats}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
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
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-16 border-t border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { value: "500+", label: "Clínicas Ativas" },
            { value: "50k+", label: "Pets Cadastrados" },
            { value: "98%", label: "Taxa de Satisfação" },
            { value: "24/7", label: "Suporte Disponível" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Componente CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Pronto para revolucionar
            <br />
            sua clínica veterinária?
          </h2>

          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de veterinários que já transformaram suas
            clínicas com a Petinova. Comece gratuitamente hoje mesmo!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <motion.a
              href="/auth/register"
              className="group bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-3 hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Começar Teste Grátis</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.a>

            <motion.button
              className="group text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-3 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              <span>Agendar Demo</span>
            </motion.button>
          </div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Componente Footer
function Footer() {
  const footerLinks = {
    Produto: [
      { name: "Recursos", href: "#recursos" },
      { name: "Preços", href: "#preços" },
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Petinova</span>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolucionando a gestão veterinária com tecnologia de ponta.
                Junte-se a centenas de clínicas que já transformaram seus
                resultados.
              </p>

              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(
            ([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
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
              </motion.div>
            ),
          )}
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="py-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
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
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Inscrever
              </motion.button>
            </div>
          </div>
        </motion.div>

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

// Componente Main da Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
