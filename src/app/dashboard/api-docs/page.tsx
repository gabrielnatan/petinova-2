"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  BookOpen,
  Download,
  Code,
  Key,
  Settings,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/store";
import 'highlight.js/styles/github-dark.css';

interface RouteDoc {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
}

const routeDocs: RouteDoc[] = [
  {
    id: "autenticacao",
    title: "Autenticação e Autorização",
    description: "Login, registro, 2FA e sessões",
    content: "",
    icon: "🔐"
  },
  {
    id: "usuarios",
    title: "Gestão de Usuários",
    description: "Usuários, veterinários e tutores",
    content: "",
    icon: "👥"
  },
  {
    id: "pets",
    title: "Gestão de Pets",
    description: "Pets e tutores",
    content: "",
    icon: "🐾"
  },
  {
    id: "agendamentos",
    title: "Agendamentos e Consultas",
    description: "Agendamentos e consultas",
    content: "",
    icon: "📅"
  },
  {
    id: "prescricoes",
    title: "Prescrições e Medicamentos",
    description: "Prescrições e medicamentos",
    content: "",
    icon: "💊"
  },
  {
    id: "estoque",
    title: "Estoque e Produtos",
    description: "Estoque e produtos",
    content: "",
    icon: "📦"
  },
  {
    id: "pagamentos",
    title: "Pagamentos e Financeiro",
    description: "Pagamentos e fornecedores",
    content: "",
    icon: "💰"
  },
  {
    id: "relatorios",
    title: "Relatórios e Analytics",
    description: "Relatórios clínicos e financeiros",
    content: "",
    icon: "📊"
  },
  {
    id: "configuracoes",
    title: "Configurações e Administração",
    description: "Configurações e API keys",
    content: "",
    icon: "🔧"
  },
  {
    id: "comunicacao",
    title: "Comunicação",
    description: "Email, WhatsApp e notificações",
    content: "",
    icon: "📧"
  },
  {
    id: "integracao",
    title: "Integrações",
    description: "Integrações e webhooks",
    content: "",
    icon: "🔗"
  },
  {
    id: "upload",
    title: "Upload e Arquivos",
    description: "Upload de arquivos e otimização",
    content: "",
    icon: "📁"
  },
  {
    id: "monitoramento",
    title: "Monitoramento e Logs",
    description: "Health check, performance e logs",
    content: "",
    icon: "🔍"
  }
];

export default function ApiDocsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<RouteDoc[]>(routeDocs);
  const [selectedDoc, setSelectedDoc] = useState<string>("autenticacao");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const loadedDocs = await Promise.all(
        routeDocs.map(async (doc) => {
          try {
            const response = await fetch(`/api/docs/rotas/${getDocFileName(doc.id)}`);
            const content = await response.text();
            return { ...doc, content };
          } catch (error) {
            console.error(`Erro ao carregar ${doc.id}:`, error);
            return { ...doc, content: "# Erro ao carregar documentação" };
          }
        })
      );
      setDocs(loadedDocs);
    } catch (error) {
      console.error('Erro ao carregar documentação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocFileName = (id: string) => {
    const fileMap: Record<string, string> = {
      "autenticacao": "02-autenticacao.md",
      "usuarios": "03-usuarios.md",
      "pets": "04-pets.md",
      "agendamentos": "05-agendamentos.md",
      "prescricoes": "06-prescricoes.md",
      "estoque": "07-estoque.md",
      "pagamentos": "08-pagamentos.md",
      "relatorios": "09-relatorios.md",
      "configuracoes": "10-configuracoes.md",
      "comunicacao": "11-comunicacao.md",
      "integracao": "12-integracao.md",
      "upload": "13-upload.md",
      "monitoramento": "14-monitoramento.md"
    };
    return fileMap[id] || "";
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const downloadDoc = async (doc: RouteDoc) => {
    try {
      const blob = new Blob([doc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.id}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar documentação:', error);
    }
  };

  const filterDocs = () => {
    return docs.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };


  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando documentação das rotas...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredDocs = filterDocs();
  const currentDoc = docs.find(doc => doc.id === selectedDoc);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <BookOpen className="w-8 h-8 mr-3" />
            Documentação das Rotas da API
          </h1>
          <p className="text-text-secondary mt-1">
            Documentação completa de todas as rotas da API Petinova
          </p>
        </div>

        {currentDoc && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => downloadDoc(currentDoc)}>
              <Download className="w-4 h-4 mr-2" />
              Baixar MD
            </Button>
            <Button variant="outline" onClick={() => copyToClipboard(currentDoc.content, currentDoc.id)}>
              {copiedText === currentDoc.id ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de Documentos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar documentação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDoc === doc.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{doc.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className={`text-xs ${
                            selectedDoc === doc.id ? 'text-gray-200' : 'text-gray-500'
                          }`}>
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3">
          {currentDoc ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-3">{currentDoc.icon}</span>
                  {currentDoc.title}
                </CardTitle>
                <p className="text-text-secondary">{currentDoc.description}</p>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-6 mt-8 text-gray-900 border-b border-gray-200 pb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-4 mt-6 text-gray-800">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-medium mb-3 mt-5 text-gray-700">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-lg font-medium mb-2 mt-4 text-gray-700">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-gray-700 leading-relaxed">
                          {children}
                        </p>
                      ),
                      code: ({ inline, children, ...props }) => {
                        if (inline) {
                          return (
                            <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code className="text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700">
                          {children}
                        </td>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-gray-50">
                          {children}
                        </tr>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside my-4 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside my-4 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 mb-1 text-gray-700">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-700">
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {currentDoc.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Selecione uma documentação para visualizar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
