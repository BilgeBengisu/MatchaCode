export function showAboutModal() { 
    document.getElementById('aboutModal')?.classList.remove('hidden'); 
}

export function closeAboutModal() { 
    document.getElementById('aboutModal')?.classList.add('hidden'); 
}

// Make functions available globally for onclick handlers
window.showAboutModal = showAboutModal;
window.closeAboutModal = closeAboutModal;