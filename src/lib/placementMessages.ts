export function friendlyPlacementMessage(reason: string, playerName: string, targetDesc: string): string {
  const reasonLower = reason.toLowerCase();

  let action = '';

  if (reasonLower === 'exact primary') {
    action = 'Perfect match';
  } else if (reasonLower === 'exact secondary') {
    action = 'Secondary match';
  } else if (reasonLower.includes('alternate (0.8)')) {
    action = 'Good fit';
  } else if (reasonLower.includes('alternate (0.6)')) {
    action = 'Acceptable fit';
  } else if (reasonLower.includes('no compatible slots') || reasonLower.includes('gk rule')) {
    action = 'Bench (GK rule)';
  } else if (reasonLower.includes('bench fallback') || reasonLower.includes('score=0')) {
    action = 'Bench (no fit)';
  } else if (reasonLower.includes('no formation') || reasonLower.includes('no open')) {
    action = 'Bench (no space)';
  } else {
    action = reason;
  }

  return `${playerName} → ${targetDesc} (${action})`;
}

export function getFriendlyReason(reason: string): string {
  const reasonLower = reason.toLowerCase();

  if (reasonLower === 'exact primary') {
    return 'Perfect match';
  } else if (reasonLower === 'exact secondary') {
    return 'Secondary match';
  } else if (reasonLower.includes('alternate (0.8)')) {
    return 'Good fit';
  } else if (reasonLower.includes('alternate (0.6)')) {
    return 'Acceptable fit';
  } else if (reasonLower.includes('no compatible slots') || reasonLower.includes('gk rule')) {
    return 'Bench (GK rule)';
  } else if (reasonLower.includes('bench fallback') || reasonLower.includes('score=0')) {
    return 'Bench (no fit)';
  } else if (reasonLower.includes('no formation') || reasonLower.includes('no open')) {
    return 'Bench (no space)';
  }

  return reason;
}
