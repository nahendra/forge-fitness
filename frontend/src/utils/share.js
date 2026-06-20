export async function shareText(text, onCopied) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'FORGE Fitness', text });
      return;
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
  }
  await navigator.clipboard?.writeText(text);
  onCopied?.();
}

export function shareToWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export function shareToTwitter(text) {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}
