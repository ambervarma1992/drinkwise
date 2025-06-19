export interface DrinkDefinition {
  name: string;
  volume: string;
  abv: string;
  units: number;
}

export interface DrinkCategory {
  name: string;
  drinks: DrinkDefinition[];
}

export const drinkCategories: DrinkCategory[] = [
  {
    name: "Beer / Lager / Cider",
    drinks: [
      { name: "Half pint (284ml) — standard lager (Carlsberg)", volume: "284ml", abv: "3.5%", units: 1.0 },
      { name: "Pint of lager", volume: "568ml", abv: "4%", units: 2.3 },
      { name: "Pint of strong beer (e.g. IPA)", volume: "568ml", abv: "5.2%", units: 3.0 },
      { name: "Bottle of beer (330ml)", volume: "330ml", abv: "5%", units: 1.7 },
      { name: "Can of strong cider (500ml)", volume: "500ml", abv: "7.5%", units: 3.8 }
    ]
  },
  {
    name: "Wine",
    drinks: [
      { name: "Small glass (125ml) red/white wine", volume: "125ml", abv: "12%", units: 1.5 },
      { name: "Medium glass (175ml)", volume: "175ml", abv: "13%", units: 2.3 },
      { name: "Large glass (250ml)", volume: "250ml", abv: "14%", units: 3.5 },
      { name: "Bottle of wine (750ml)", volume: "750ml", abv: "13.5%", units: 10.0 }
    ]
  },
  {
    name: "Spirits & Shots",
    drinks: [
      { name: "Single shot (25ml) of spirit (vodka, gin, etc.)", volume: "25ml", abv: "40%", units: 1.0 },
      { name: "Double shot (50ml)", volume: "50ml", abv: "40%", units: 2.0 },
      { name: "Liqueur (Baileys, Amaretto) 50ml", volume: "50ml", abv: "20%", units: 1.0 }
    ]
  },
  {
    name: "Cocktails (approximate)",
    drinks: [
      { name: "Margarita", volume: "~125ml", abv: "~33%", units: 2.1 },
      { name: "Mojito", volume: "~200ml", abv: "~10%", units: 2.0 },
      { name: "Negroni (served 90ml)", volume: "90ml", abv: "~26%", units: 2.3 },
      { name: "Long Island Iced Tea", volume: "~250ml", abv: "~22%", units: 4.0 }
    ]
  },
  {
    name: "Fortified & Other Wines",
    drinks: [
      { name: "Glass of Port/Sherry (50ml)", volume: "50ml", abv: "20%", units: 1.0 },
      { name: "Small glass of sweet wine", volume: "100ml", abv: "15%", units: 1.5 }
    ]
  }
]; 