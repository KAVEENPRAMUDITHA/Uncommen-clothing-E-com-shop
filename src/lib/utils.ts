export const formatLKR = (n: number) => {
  const num = Number(n || 0);
  return 'Rs. ' + num.toLocaleString('en-LK', { maximumFractionDigits: 0 });
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const STORE = {
  name: 'Uncommon Clothing',
  tagline: 'Wear the Difference',
  address: 'L1, 46 Kandy Rd, Kiribathgoda 11600',
  addressLine2: 'Located in: Gamma Tower',
  phone: '074 009 9060',
  website: 'uncommonclothing.lk',
  hours: 'Mon–Sun: 9:30 AM – 8:30 PM',
  rating: '5.0',
  reviewCount: 4,
  plusCode: 'XWHH+83 Kiribathgoda',
};

export const ADMIN_EMAIL = 'admin@uncommonclothing.lk';
