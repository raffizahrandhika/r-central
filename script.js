// Navigation Toggle for Mobile
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.rcentral-nav-toggle');
    const navMenu = document.querySelector('.rcentral-nav-menu');
    const body = document.querySelector('body');
    
    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.rcentral-nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            body.style.overflow = ''; // Restore scroll
            
            // Update active state
            setActiveNavLink(this);
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Function to set active navigation link
    function setActiveNavLink(clickedLink) {
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        clickedLink.classList.add('active');
    }
    
    // Scroll spy to update active nav link based on section in view
    function updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        // Find the current section in view
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });
        
        // If we're at the very top of the page, set Home as active
        if (scrollPos < 100) {
            currentSectionId = 'home';
        }
        
        // Update active nav link
        if (currentSectionId) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to corresponding link
            const activeLink = document.querySelector(`.rcentral-nav-menu a[href="#${currentSectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
    
    // Initialize active nav on page load
    updateActiveNavOnScroll();
    
    // Update active nav on scroll with throttle for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                scrollTimeout = null;
                updateActiveNavOnScroll();
            }, 100);
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            
            // Update active state
            setActiveNavLink(this);
        });
    });
    
    // Animate skill bars when they come into view
    const skillBars = document.querySelectorAll('.skill-bar');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const percentage = skillBar.getAttribute('data-percentage');
                
                // Reset width to 0 for animation
                skillBar.style.width = '0%';
                
                // Animate to the actual percentage
                setTimeout(() => {
                    skillBar.style.transition = 'width 1.5s ease-in-out';
                    skillBar.style.width = percentage + '%';
                }, 300);
                
                skillObserver.unobserve(skillBar);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
    
    // Add hover effect to skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(category => {
        category.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        category.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Intersection Observer untuk animasi card
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.rcentral-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Close menu on window resize (if resizing to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Set Home as active by default on page load
    const homeLink = document.querySelector('.rcentral-nav-menu a[href="#home"]');
    if (homeLink && !document.querySelector('.rcentral-nav-menu a.active')) {
        homeLink.classList.add('active');
    }
    
    // Fetch and initialize certificates from CSV
    loadCertificatesFromCSV();
});

// Global variable to store certificates data
let certificatesData = {};
let certificatesExpanded = false;

// Fetch CSV data from Google Sheets
async function loadCertificatesFromCSV() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8YyGPAC4er9r6d5zpeoWomBXrcVHmnIJpx8HIqxhr7t_qWvC2zg3Fc2fcP_XFcXXT_eL40vdDDCdU/pub?gid=0&single=true&output=csv';
    
    try {
        const response = await fetch(csvUrl);
        const csv = await response.text();
        
        // Parse CSV
        certificatesData = parseCSV(csv);
        
        // Generate HTML cards
        generateCertificateCards(certificatesData);
        
        // Initialize certificate display
        initializeCertificates();
        
        // Update certificate count
        updateCertificateCount();
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

// Parse CSV string to object
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const certificates = {};
    
    for (let i = 1; i < lines.length; i++) {
        // Handle CSV parsing with quoted values
        const values = parseCSVLine(lines[i]);
        
        if (values.length === 0 || !values[0]) continue;
        
        const id = values[0].trim();
        const cert = {
            id: id,
            title: values[1] ? values[1].trim() : '',
            titleIcon: values[2] ? values[2].trim() : 'fa-file-alt',
            subtitle: values[3] ? values[3].trim() : '',
            date: values[4] ? values[4].trim() : '',
            imageUrl: values[5] ? values[5].trim() : '',
            issuer: values[6] ? values[6].trim() : '',
            type: values[7] ? values[7].trim() : '',
            description: values[8] ? values[8].trim() : '',
            verifyUrl: values[9] ? values[9].trim() : '#'
        };
        
        certificates[id] = cert;
    }
    
    return certificates;
}

// Parse CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Generate certificate cards from data
function generateCertificateCards(certificatesData) {
    const grid = document.querySelector('.rcentral-achievements-grid');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Sort by ID descending (newest first)
    const sortedIds = Object.keys(certificatesData).sort().reverse();
    
    sortedIds.forEach(id => {
        const cert = certificatesData[id];
        
        // Clean icon class - remove spaces and ensure fa- prefix
        let iconClass = cert.titleIcon.replace(/\s+/g, '-').toLowerCase();
        if (!iconClass.startsWith('fa-')) {
            iconClass = 'fa-' + iconClass;
        }
        
        const card = document.createElement('div');
        card.className = 'rcentral-achievement-card';
        card.innerHTML = `
            <div class="rcentral-achievement-preview">
                <div class="rcentral-certificate-placeholder">
                    <i class="fas ${iconClass}"></i>
                </div>
            </div>
            <div class="rcentral-achievement-content">
                <h3>${cert.title}</h3>
                <p>${cert.description}</p>
                <div class="rcentral-achievement-meta">
                    <span class="rcentral-achievement-date">${cert.date}</span>
                    <span class="rcentral-achievement-issuer">${cert.issuer}</span>
                </div>
                <div class="rcentral-achievement-actions">
                    <button class="rcentral-certificate-btn" onclick="previewCertificate('${id}')">
                        <i class="fas fa-eye"></i>
                        Preview Certificate
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Certificate Preview Function
function previewCertificate(certificateId) {
    const modal = document.getElementById('certificateModal');
    const certificate = certificatesData[certificateId];

    if (!certificate) {
        console.error('Certificate not found:', certificateId);
        return;
    }

    // Update modal content
    document.getElementById('modalCertificateTitle').textContent = certificate.title;
    document.getElementById('modalCertificateSubtitle').textContent = certificate.subtitle;
    document.getElementById('modalCertificateDate').textContent = certificate.date;
    document.getElementById('certificateImage').src = certificate.imageUrl;
    document.getElementById('detailIssuer').textContent = certificate.issuer;
    document.getElementById('detailDate').textContent = certificate.date;
    document.getElementById('detailType').textContent = certificate.type;
    document.getElementById('detailDescription').textContent = certificate.description;

    const verifyLink = document.getElementById('verificationLink');
    verifyLink.href = certificate.verifyUrl;
    if (certificate.verifyUrl === '#' || !certificate.verifyUrl) {
        verifyLink.style.display = 'none';
    } else {
        verifyLink.style.display = 'inline-flex';
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById('certificateModal');
    modal.style.display = "none";
    document.body.style.overflow = "";
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('certificateModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Global function for certificate toggle
function toggleCertificates() {
    const cards = document.querySelectorAll('.rcentral-achievement-card');
    const btn = document.getElementById('toggleCertificatesBtn');
    
    certificatesExpanded = !certificatesExpanded;
    
    if (certificatesExpanded) {
        // Show all cards
        cards.forEach(card => {
            card.classList.add('visible');
        });
        btn.innerHTML = '<i class="fas fa-chevron-up"></i> Tutup';
    } else {
        // Show only first 3 (which are the newest due to reverse order)
        cards.forEach((card, index) => {
            if (index < 3) {
                card.classList.add('visible');
            } else {
                card.classList.remove('visible');
            }
        });
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Lihat Sertifikat Lainnya';
        
        // Scroll to achievements section
        const achievementsSection = document.getElementById('achievements');
        if (achievementsSection) {
            achievementsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function initializeCertificates() {
    const cards = document.querySelectorAll('.rcentral-achievement-card');
    
    // Show only first 3 cards by default
    cards.forEach((card, index) => {
        if (index < 3) {
            card.classList.add('visible');
        }
    });
    
    certificatesExpanded = false;
}

function updateCertificateCount() {
    const cards = document.querySelectorAll('.rcentral-achievement-card');
    const countElement = document.getElementById('certificateCount');
    const totalCertificates = cards.length;
    
    if (countElement) {
        countElement.textContent = `Total ${totalCertificates} ${totalCertificates === 1 ? 'certificate' : 'certificates'}`;
    }
}
