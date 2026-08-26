export function validateEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());
}

export function formatDateExp(dateExp) { 
    const date = new Date(dateExp); 
    return new Intl.DateTimeFormat('en-US', { 
        timeZone: 'America/Los_Angeles', 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hourCycle: 'h23'}).format(date); 
}

