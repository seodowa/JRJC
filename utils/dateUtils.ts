export function getTimeAgo(date: Date) {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);

      if (weeks === 1) return `${weeks} week ago`;
      
      return `${weeks} weeks ago`;
    }
    
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);

      if (months === 1) return `${months} month ago`; 
      
      return `${months} months ago`;
    }

    const years = Math.floor(diffInDays / 365);
    
    if (years === 1) return `${years} year ago`;
    
    return `${years} years ago`;
  }