export type BoletosTeamMeta = {
  code: string;
  fallbackName: string;
  venue: string;
  borderColor: string;
};

export const BOLETOS_TEAMS_META: BoletosTeamMeta[] = [
  { code: 'SGE', fallbackName: 'Atléticos de San Germán',        venue: 'Coliseo Arquelio Torres Ramírez',          borderColor: '#F75400' },
  { code: 'SCE', fallbackName: 'Cangrejeros de Santurce',        venue: 'Coliseo Roberto Clemente',                 borderColor: '#FA4515' },
  { code: 'ARE', fallbackName: 'Capitanes de Arecibo',           venue: 'Coliseo Manuel "Petaca" Iguina',           borderColor: '#FFB900' },
  { code: 'CAG', fallbackName: 'Criollos de Caguas',             venue: 'Coliseo Roger Mendoza',                    borderColor: '#DDB7E7' },
  { code: 'CAR', fallbackName: 'Gigantes de Carolina/Canóvanas', venue: 'Coliseo Carlos Miguel Mangual',            borderColor: '#FEC200' },
  { code: 'MAY', fallbackName: 'Indios de Mayagüez',             venue: 'Palacio de Recreación y Deportes Wilkins', borderColor: '#F5E0BF' },
  { code: 'PON', fallbackName: 'Leones de Ponce',                venue: 'Auditorio Pachín Vicéns',                  borderColor: '#B82027' },
  { code: 'GBO', fallbackName: 'Mets de Guaynabo',               venue: 'Coliseo Mario "Quijote" Morales',          borderColor: '#245AA3' },
  { code: 'MAN', fallbackName: 'Osos de Manatí',                 venue: 'Coliseo Juan Aubín Cruz',                  borderColor: '#347CAF' },
  { code: 'QUE', fallbackName: 'Piratas de Quebradillas',        venue: 'Coliseo Raymond Dalmau',                   borderColor: '#F9170C' },
  { code: 'AGU', fallbackName: 'Santeros de Aguada',             venue: 'Coliseo Ismael "Chavalillo" Delgado',      borderColor: '#67CA59' },
  { code: 'BAY', fallbackName: 'Vaqueros de Bayamón',            venue: 'Coliseo Rubén Rodríguez',                  borderColor: '#468AD9' },
];
