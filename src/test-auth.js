// Script simples para testar a autenticação
const testAuth = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'gabriel--natan@live.com',
        password: 'senha_teste' // Você precisará usar a senha correta
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

testAuth();

