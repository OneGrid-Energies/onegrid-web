import { mkdir, readFile, writeFile } from 'node:fs/promises';

const source = await readFile('index.html', 'utf8');
const routes = {
  home: {
    directory: 'home',
    path: '/',
    title: 'OneGrid Energies | Clean Energy That Reduces Darkness',
    description: 'OneGrid Energies delivers clean energy, solar installations, circular innovation, and community impact solutions that reduce darkness across Nigeria.'
  },
  about: {
    directory: 'about',
    path: '/about/',
    title: 'About OneGrid Energies | Clean Energy & Circular Innovation',
    description: 'Discover how OneGrid Energies turns clean-energy innovation, recycling, and human empowerment into practical impact across Nigeria.'
  },
  oneplastic: {
    directory: 'oneplastic',
    path: '/oneplastic/',
    title: 'OnePlastic Initiative | OneGrid Energies',
    description: 'OnePlastic transforms waste plastic bottles and discarded batteries into solar-powered lanterns for communities without reliable electricity.'
  },
  stories: {
    directory: 'stories-of-hope',
    path: '/stories-of-hope/',
    title: 'Stories of Hope | OneGrid Energies',
    description: 'Meet the people and communities gaining safer, cleaner light through OneGrid Energies and the OnePlastic initiative.'
  },
  recognitions: {
    directory: 'recognitions',
    path: '/recognitions/',
    title: 'Recognition, Milestones & Media | OneGrid Energies',
    description: 'Explore OneGrid Energies’ recognitions, milestones, and media coverage for clean energy, circular innovation, and community impact.'
  },
  quote: {
    directory: 'quote',
    path: '/quote/',
    title: 'Get a Solar Quote | OneGrid Energies',
    description: 'Get a tailored solar or CCTV installation quote from OneGrid Energies for your home, business, school, or community.'
  },
  contact: {
    directory: 'contact',
    path: '/contact/',
    title: 'Contact OneGrid Energies | Partner With Us',
    description: 'Contact OneGrid Energies to discuss solar solutions, clean-energy partnerships, community impact, or media enquiries.'
  }
};

const firstPage = source.indexOf('<div class="page active" id="page-home">');
const footer = source.indexOf('    <!-- ════════════════ FOOTER ══════════════════════════ -->');

if (firstPage === -1 || footer === -1) {
  throw new Error('Could not locate the shared layout or page sections in index.html.');
}

const sharedHeader = source.slice(0, firstPage);
const sharedFooter = source.slice(footer);

function pageMarkup(page) {
  const pageStart = source.indexOf(`<div class="page${page === 'home' ? ' active' : ''}" id="page-${page}">`);
  const pageEndMarker = `    <!-- /page-${page} -->`;
  const pageEnd = source.indexOf(pageEndMarker, pageStart);

  if (pageStart === -1 || pageEnd === -1) {
    throw new Error(`Could not locate the ${page} page section.`);
  }

  return source.slice(pageStart, pageEnd).replace(`class="page${page === 'home' ? ' active' : ''}"`, 'class="page active"');
}

function setPageMetadata(document, route) {
  const url = `https://onegridenergies.com${route.path}`;
  return document
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${route.description}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${route.title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${route.description}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${route.title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${route.description}$2`);
}

await Promise.all(Object.entries(routes).map(async ([page, route]) => {
  const document = setPageMetadata(`${sharedHeader}${pageMarkup(page)}${sharedFooter}`, route);
  await mkdir(route.directory, { recursive: true });
  await writeFile(`${route.directory}/index.html`, document);
}));

console.log(`Generated ${Object.keys(routes).length} static route documents.`);
