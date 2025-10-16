const { useState, useEffect, useRef } = React;
const { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation } = ReactRouterDOM;

// Simulated authentication and data management
class AppState {
  constructor() {
    this.currentUser = null;
    this.users = [
      { id: 1, nom: 'Ahmed', prenom: 'Ben Ali', email: 'ahmed@farm.tn', role: 'user', password: 'password123' },
      { id: 2, nom: 'Admin', prenom: 'System', email: 'admin@farmlink.tn', role: 'admin', password: 'admin123' }
    ];
    this.modules = [
      { id: 1, type: 'Irrigation intelligente', description: 'Contrôle automatique de l\'arrosage', status: 'Actif', value: 85 },
      { id: 2, type: 'Surveillance environnementale', description: 'Capteurs température et humidité', status: 'En ligne', value: 23 },
      { id: 3, type: 'Contrôle des pompes', description: 'Gestion à distance des pompes', status: 'Maintenance', value: 67 }
    ];
    this.chatHistory = [];
    this.farmStats = {
      totalModules: 3,
      activeModules: 2,
      alertes: 1,
      efficacite: 92
    };
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser = user;
      return { success: true, user };
    }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  }

  register(userData) {
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }
    
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      role: 'user'
    };
    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  logout() {
    this.currentUser = null;
  }

  addChatMessage(message, isUser = true) {
    this.chatHistory.push({
      id: Date.now(),
      message,
      isUser,
      timestamp: new Date()
    });
  }

  getBotResponse(message) {
    const responses = {
      'irrigation': 'Pour l\'irrigation, je recommande de vérifier l\'humidité du sol avant d\'arroser. Utilisez des capteurs pour optimiser la consommation d\'eau.',
      'pompe': 'Les pompes doivent être entretenues régulièrement. Vérifiez les filtres et la pression du système.',
      'température': 'La température optimale varie selon les cultures. En général, maintenez entre 18-25°C pour la plupart des légumes.',
      'humidité': 'L\'humidité du sol doit être maintenue entre 60-80% pour la plupart des cultures. Utilisez nos capteurs pour un monitoring précis.',
      'default': 'Je suis votre conseiller IA agricole. Posez-moi des questions sur l\'irrigation, les pompes, la température, l\'humidité ou tout autre sujet agricole.'
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    return responses.default;
  }
}

const appState = new AppState();

// Header Component
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(appState.currentUser);

  const handleLogout = () => {
    appState.logout();
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="navbar">
        <Link to="/" className="logo">FarmLink</Link>
        
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/') ? 'active' : ''}>Accueil</Link></li>
          <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>À propos</Link></li>
          <li><Link to="/how-it-works" className={isActive('/how-it-works') ? 'active' : ''}>Comment ça marche</Link></li>
          <li><Link to="/solutions" className={isActive('/solutions') ? 'active' : ''}>Solutions</Link></li>
          <li><Link to="/ai-advisor" className={isActive('/ai-advisor') ? 'active' : ''}>Conseiller IA</Link></li>
          <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
          
          {user ? (
            <>
              <li><Link to="/account" className={isActive('/account') ? 'active' : ''}>Mon Compte</Link></li>
              {user.role === 'admin' && (
                <li><Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link></li>
              )}
              <li><button onClick={handleLogout} className="btn btn--outline btn--sm">Déconnexion</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn--outline btn--sm">Connexion</Link></li>
              <li><Link to="/register" className="btn btn--primary btn--sm">S'inscrire</Link></li>
            </>
          )}
        </ul>
        
        <div className="mobile-menu">
          <span>☰</span>
        </div>
      </nav>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FarmLink</h3>
            <p>Solutions de modernisation abordables pour une agriculture plus efficace.</p>
          </div>
          <div className="footer-section">
            <h3>Liens rapides</h3>
            <Link to="/about">À propos</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <Link to="/ai-advisor">Conseiller IA</Link>
            <a href="mailto:support@farmlink.tn">support@farmlink.tn</a>
            <a href="tel:+216123456789">+216 12 345 6789</a>
          </div>
          <div className="footer-section">
            <h3>Suivez-nous</h3>
            <a href="#">Facebook</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 FarmLink. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

// Home Page
function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>L'Agriculture de Demain</h1>
          <p>Solutions de modernisation abordables pour une agriculture plus efficace. Transformez votre ferme avec nos technologies intelligentes.</p>
          <div className="flex gap-16 justify-center">
            <button onClick={() => navigate('/register')} className="btn btn--primary btn--lg">Commencer maintenant</button>
            <button onClick={() => navigate('/solutions')} className="btn btn--outline btn--lg">Découvrir nos solutions</button>
          </div>
        </div>
      </section>

      <section className="features py-24">
        <div className="container">
          <h2 className="text-center mb-16">Nos Solutions</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💧</div>
              <h3>Irrigation Intelligente</h3>
              <p>Système d'irrigation automatisé qui s'adapte aux besoins de vos cultures et aux conditions météorologiques.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Surveillance Environnementale</h3>
              <p>Capteurs IoT pour surveiller la température, l'humidité et les conditions du sol en temps réel.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Contrôle des Pompes</h3>
              <p>Gestion à distance de vos équipements de pompage pour une efficacité énergétique optimale.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div className="container py-24">
      <h1 className="text-center mb-24">À propos de FarmLink</h1>
      
      <div className="card mb-24">
        <div className="card__body">
          <h2 className="mb-16">L'Agriculture de Demain, Une Récolte à la Fois</h2>
          <p>FarmLink est née de la vision de démocratiser les technologies agricoles intelligentes. Notre mission est de rendre l'agriculture de précision accessible à tous les agriculteurs, quelle que soit la taille de leur exploitation.</p>
          
          <h3 className="mt-24 mb-16">Notre Vision</h3>
          <p>Nous croyons qu'une agriculture plus intelligente et plus durable est possible grâce à la technologie. En connectant les fermes au cloud et en utilisant l'intelligence artificielle, nous aidons les agriculteurs à optimiser leurs rendements tout en préservant l'environnement.</p>
          
          <h3 className="mt-24 mb-16">Nos Valeurs</h3>
          <ul style={{paddingLeft: '20px'}}>
            <li><strong>Innovation :</strong> Nous développons des solutions technologiques de pointe</li>
            <li><strong>Accessibilité :</strong> Nos solutions sont conçues pour être abordables</li>
            <li><strong>Durabilité :</strong> Nous promouvons une agriculture respectueuse de l'environnement</li>
            <li><strong>Support :</strong> Nous accompagnons nos utilisateurs à chaque étape</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// How It Works Page
function HowItWorksPage() {
  return (
    <div className="container py-24">
      <h1 className="text-center mb-24">Comment ça marche</h1>
      
      <div className="features-grid">
        <div className="card">
          <div className="card__body text-center">
            <div className="feature-icon">🔧</div>
            <h3>1. Installation Retrofit</h3>
            <p>Nos techniciens installent les capteurs et dispositifs de contrôle sur votre équipement existant. Aucun remplacement coûteux nécessaire.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card__body text-center">
            <div className="feature-icon">☁️</div>
            <h3>2. Connexion Cloud</h3>
            <p>Vos équipements se connectent automatiquement à notre plateforme cloud sécurisée pour une surveillance 24/7.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card__body text-center">
            <div className="feature-icon">📱</div>
            <h3>3. Contrôle &amp; Optimisation</h3>
            <p>Utilisez notre application pour surveiller, contrôler et optimiser vos opérations agricoles depuis n'importe où.</p>
          </div>
        </div>
      </div>
      
      <div className="card mt-24">
        <div className="card__body">
          <h2 className="mb-16">Processus d'installation</h2>
          <ol style={{paddingLeft: '20px'}}>
            <li><strong>Évaluation gratuite :</strong> Nos experts analysent votre ferme et vos besoins</li>
            <li><strong>Devis personnalisé :</strong> Nous proposons une solution adaptée à votre budget</li>
            <li><strong>Installation :</strong> Installation rapide (1-2 jours) par nos techniciens certifiés</li>
            <li><strong>Formation :</strong> Formation complète à l'utilisation de la plateforme</li>
            <li><strong>Support continu :</strong> Support technique et conseil agronomique 7j/7</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Solutions Page
function SolutionsPage() {
  return (
    <div className="container py-24">
      <h1 className="text-center mb-24">Nos Solutions</h1>
      
      <div className="features-grid">
        <div className="card">
          <div className="card__body">
            <div className="feature-icon mb-16">💧</div>
            <h3>Irrigation Intelligente</h3>
            <p>Système d'irrigation automatisé basé sur l'IA qui analyse les données météorologiques, l'humidité du sol et les besoins des cultures.</p>
            <ul style={{paddingLeft: '20px', marginTop: '16px'}}>
              <li>Économie d'eau jusqu'à 40%</li>
              <li>Programmation automatique</li>
              <li>Alertes en temps réel</li>
              <li>Compatible avec tous types de systèmes</li>
            </ul>
          </div>
        </div>
        
        <div className="card">
          <div className="card__body">
            <div className="feature-icon mb-16">🌡️</div>
            <h3>Surveillance Environnementale</h3>
            <p>Réseau de capteurs IoT pour surveiller les conditions environnementales de votre exploitation en temps réel.</p>
            <ul style={{paddingLeft: '20px', marginTop: '16px'}}>
              <li>Température et humidité</li>
              <li>pH et conductivité du sol</li>
              <li>Conditions météorologiques locales</li>
              <li>Historique et tendances</li>
            </ul>
          </div>
        </div>
        
        <div className="card">
          <div className="card__body">
            <div className="feature-icon mb-16">⚙️</div>
            <h3>Contrôle des Pompes</h3>
            <p>Gestion intelligente de vos pompes et équipements pour optimiser la consommation énergétique et prolonger leur durée de vie.</p>
            <ul style={{paddingLeft: '20px', marginTop: '16px'}}>
              <li>Démarrage/arrêt automatique</li>
              <li>Surveillance de la pression</li>
              <li>Maintenance prédictive</li>
              <li>Économie d'énergie jusqu'à 30%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Advisor Page
function AIAdvisorPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(appState.chatHistory);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [messages]);
  
  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    appState.addChatMessage(message, true);
    setMessages([...appState.chatHistory]);
    
    // Get bot response
    setTimeout(() => {
      const botResponse = appState.getBotResponse(message);
      appState.addChatMessage(botResponse, false);
      setMessages([...appState.chatHistory]);
    }, 1000);
    
    setMessage('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  return (
    <div className="container py-24">
      <h1 className="text-center mb-24">Conseiller IA Agricole</h1>
      
      <div className="chat-container">
        <div className="chat-header">
          <h3>Assistant IA FarmLink</h3>
          <p>Posez vos questions sur l'agriculture, l'irrigation, et la gestion de votre ferme</p>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="message bot">
              <div className="message-bubble">
                Bonjour ! Je suis votre conseiller IA agricole. Comment puis-je vous aider aujourd'hui ?
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
              <div className="message-bubble">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre question..."
            className="form-control"
          />
          <button onClick={sendMessage} className="btn btn--primary">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// Account/Dashboard Page
function AccountPage() {
  const navigate = useNavigate();
  const [user] = useState(appState.currentUser);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="dashboard">
      <div className="container">
        <h1 className="mb-24">Dashboard - {user.prenom} {user.nom}</h1>
        
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-value">{appState.farmStats.totalModules}</div>
            <div className="stat-label">Modules Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{appState.farmStats.activeModules}</div>
            <div className="stat-label">Modules Actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{appState.farmStats.alertes}</div>
            <div className="stat-label">Alertes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{appState.farmStats.efficacite}%</div>
            <div className="stat-label">Efficacité</div>
          </div>
        </div>
        
        <h2 className="mb-16">Mes Modules</h2>
        <div className="dashboard-grid">
          {appState.modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="flex justify-between items-center mb-16">
                <h3>{module.type}</h3>
                <span className={`module-status status-${module.status.toLowerCase().replace(' ', '-')}`}>
                  {module.status}
                </span>
              </div>
              <p>{module.description}</p>
              <div className="mt-16">
                <div className="stat-value">{module.value}%</div>
                <div className="stat-label">Performance</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Contact Page
function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ nom: '', email: '', sujet: '', message: '' });
  };
  
  return (
    <div className="container py-24">
      <h1 className="text-center mb-24">Contactez-nous</h1>
      
      <div className="flex" style={{gap: '40px'}}>
        <div style={{flex: '1'}}>
          <div className="card">
            <div className="card__body">
              <h3 className="mb-16">Informations de contact</h3>
              <div className="mb-16">
                <strong>Adresse :</strong><br />
                123 Avenue de l'Agriculture<br />
                1000 Tunis, Tunisie
              </div>
              <div className="mb-16">
                <strong>Téléphone :</strong><br />
                +216 12 345 6789
              </div>
              <div className="mb-16">
                <strong>Email :</strong><br />
                contact@farmlink.tn
              </div>
              <div>
                <strong>Heures d'ouverture :</strong><br />
                Lun-Ven : 8h00 - 18h00<br />
                Sam : 8h00 - 12h00
              </div>
            </div>
          </div>
        </div>
        
        <div style={{flex: '1'}}>
          <div className="card">
            <div className="card__body">
              {submitted && (
                <div style={{background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '16px'}}>
                  Votre message a été envoyé avec succès !
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sujet</label>
                  <select
                    className="form-control"
                    value={formData.sujet}
                    onChange={(e) => setFormData({...formData, sujet: e.target.value})}
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="info">Demande d'information</option>
                    <option value="demo">Demande de démonstration</option>
                    <option value="support">Support technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn--primary btn--full-width">
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Login Page
function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const result = appState.login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/account');
      window.location.reload(); // Force refresh to update header
    } else {
      setError(result.error);
    }
  };
  
  return (
    <div className="container py-24">
      <div className="auth-container">
        <h1 className="auth-title">Connexion</h1>
        
        {error && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '16px'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="btn btn--primary btn--full-width mb-16">
            Se connecter
          </button>
        </form>
        
        <div className="text-center">
          <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
          <p style={{fontSize: '12px', color: '#666', marginTop: '16px'}}>
            <strong>Comptes de test :</strong><br />
            Utilisateur : ahmed@farm.tn / password123<br />
            Admin : admin@farmlink.tn / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

// Register Page
function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    const result = appState.register(formData);
    
    if (result.success) {
      appState.currentUser = result.user;
      navigate('/account');
      window.location.reload(); // Force refresh to update header
    } else {
      setError(result.error);
    }
  };
  
  return (
    <div className="container py-24">
      <div className="auth-container">
        <h1 className="auth-title">Créer un compte</h1>
        
        {error && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '16px'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input
              type="text"
              className="form-control"
              value={formData.prenom}
              onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input
              type="text"
              className="form-control"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="btn btn--primary btn--full-width mb-16">
            Créer le compte
          </button>
        </form>
        
        <div className="text-center">
          <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}

// Admin Page
function AdminPage() {
  const navigate = useNavigate();
  const [user] = useState(appState.currentUser);
  
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  return (
    <div className="admin-panel">
      <div className="container">
        <h1 className="mb-24">Panel Administrateur</h1>
        
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-value">{appState.users.length}</div>
            <div className="stat-label">Utilisateurs Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{appState.users.filter(u => u.role === 'user').length}</div>
            <div className="stat-label">Utilisateurs Actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{appState.modules.length}</div>
            <div className="stat-label">Modules Déployés</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">98%</div>
            <div className="stat-label">Uptime Système</div>
          </div>
        </div>
        
        <h2 className="mb-16 mt-24">Gestion des Utilisateurs</h2>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appState.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nom}</td>
                  <td>{user.prenom}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`module-status ${user.role === 'admin' ? 'status-maintenance' : 'status-active'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn--outline btn--sm">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <h2 className="mb-16 mt-24">Modules du Système</h2>
        <div className="dashboard-grid">
          {appState.modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="flex justify-between items-center mb-16">
                <h3>{module.type}</h3>
                <span className={`module-status status-${module.status.toLowerCase().replace(' ', '-')}`}>
                  {module.status}
                </span>
              </div>
              <p>{module.description}</p>
              <div className="mt-16 flex gap-8">
                <button className="btn btn--outline btn--sm">Configurer</button>
                <button className="btn btn--secondary btn--sm">Maintenance</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/ai-advisor" element={<AIAdvisorPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);