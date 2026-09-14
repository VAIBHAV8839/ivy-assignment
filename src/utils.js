// Utility formatting helpers

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const num = Number(amount);
  if (num < 0) return `-₹${Math.abs(num).toLocaleString('en-IN')}`;
  
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk.toFixed(2).replace(/\.00$/, '')} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatArea(carpetArea, website) {
  if (!carpetArea) return 'N/A';
  // Check if carpet area is reported in square meters (magichomes under 200)
  if (website === 'magichomes' && carpetArea < 200) {
    const sqft = Math.round(carpetArea * 10.7639);
    return `${sqft} sq.ft (${carpetArea} m²)`;
  }
  return `${carpetArea} sq.ft`;
}

export function getCleanPrice(listing) {
  let price = listing.price || 0;
  // Handle thousands anomaly
  if (price > 0 && price < 100000) {
    price *= 1000;
  }
  return price;
}

export function getCleanCarpet(listing) {
  const carpet = listing.carpet_area || 0;
  if (listing.website === 'magichomes' && carpet < 200) {
    return Math.round(carpet * 10.7639);
  }
  return carpet;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
