/**
 * SIDEBAR COMPONENT - Role-based Navigation
 * Generates sidebar HTML based on user role (candidate or company)
 */

function renderSidebar(currentPage = '') {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'candidate';
  const userName = user.name || 'User';
  const userTitle = role === 'candidate' ? (user.profile?.title || 'Professional') : 'Company';

  // Navigation links based on role
  const candidateLinks = [
    { href: '/src/pages/candidate-dashboard/index.html', icon: 'fa-chart-line', label: 'Dashboard', page: 'dashboard' },
    { href: '/src/pages/candidate-jobs/index.html', icon: 'fa-briefcase', label: 'Job Offers', page: 'jobs' },
    { href: '/src/pages/candidate-matches/index.html', icon: 'fa-handshake', label: 'My Matches', page: 'matches' },
    { href: '/src/pages/candidate-interviews/index.html', icon: 'fa-calendar-check', label: 'Interviews', page: 'interviews' }
  ];

  const companyLinks = [
    { href: '/src/pages/company-dashboard/index.html', icon: 'fa-chart-line', label: 'Dashboard', page: 'dashboard' },
    { href: '/src/pages/company-jobs/index.html', icon: 'fa-briefcase', label: 'Job Offers', page: 'jobs' },
    { href: '/src/pages/company-candidates/index.html', icon: 'fa-user-group', label: 'Find Candidates', page: 'candidates' },
    { href: '/src/pages/company-matches/index.html', icon: 'fa-handshake', label: 'Matches', page: 'matches' },
    { href: '/src/pages/company-interviews/index.html', icon: 'fa-calendar-check', label: 'Interviews', page: 'interviews' }
  ];

  const links = role === 'candidate' ? candidateLinks : companyLinks;

  const navHTML = links.map(link => {
    const isActive = currentPage.includes(link.page) ? 'class="active"' : '';
    return `
      <a href="${link.href}" ${isActive}>
        <i class="fa-solid ${link.icon}"></i> ${link.label}
      </a>
    `;
  }).join('');

  return `
    <aside class="sidebar">
      <div>
        <h1 class="sidebar-logo">MatchFlow</h1>
        <nav class="sidebar-nav">
          ${navHTML}
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="avatar"></div>
        <div>
          <p class="user-name">${userName}</p>
          <p class="user-role">${userTitle}</p>
        </div>
      </div>
    </aside>
  `;
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', () => {
  const sidebarContainer = document.querySelector('.sidebar');
  if (sidebarContainer) {
    const currentPage = window.location.pathname;
    sidebarContainer.outerHTML = renderSidebar(currentPage);
  }
});

/**
 * Role Guard - Redirect if user tries to access wrong role's page
 */
function guardRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.role) {
    // Not logged in
    window.location.href = '/src/pages/login/index.html';
    return false;
  }

  if (user.role !== requiredRole) {
    // Wrong role - redirect to appropriate dashboard
    const redirectMap = {
      'candidate': '/src/pages/candidate-dashboard/index.html',
      'company': '/src/pages/company-dashboard/index.html'
    };
    window.location.href = redirectMap[user.role];
    return false;
  }

  return true;
}

// Export for use in pages
if (typeof window !== 'undefined') {
  window.renderSidebar = renderSidebar;
  window.guardRole = guardRole;
}
