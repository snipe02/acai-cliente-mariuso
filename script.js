/* =========================================================
   CONFIGURAÇÃO
   WhatsApp da loja: DDI + DDD + número (somente dígitos)
========================================================= */
const WHATSAPP_NUMBER = "558695221650";
const INSTAGRAM_URL = "https://instagram.com/oficinadolanche_projeto";
const DEFAULT_PRODUCT_ID = "c400";

/* =========================================================
   DADOS (conforme o cardápio)
   includedCreams = cremes já incluídos no preço do tamanho
========================================================= */
const PRODUCTS = [
  {
    id: "c300",
    group: "copos",
    label: "Copo 300ml",
    size: "300ml",
    price: 16,
    includedCreams: 0,
    limits: { fruits: 1, toppings: 3, syrups: 1 },
  },
  {
    id: "c400",
    group: "copos",
    label: "Copo 400ml",
    size: "400ml",
    price: 22,
    includedCreams: 0,
    limits: { fruits: 2, toppings: 4, syrups: 2 },
  },
  {
    id: "c500",
    group: "copos",
    label: "Copo 500ml",
    size: "500ml",
    price: 25,
    includedCreams: 1, // +1 creme
    limits: { fruits: 3, toppings: 6, syrups: 3 },
  },
  {
    id: "bm",
    group: "bacias",
    label: "Bacia M",
    size: "Bacia M",
    price: 35,
    includedCreams: 2, // +2 cremes
    limits: { fruits: 3, toppings: 8, syrups: 3 },
  },
  {
    id: "b750",
    group: "bacias",
    label: "Bacia 750g",
    size: "750g",
    price: 45,
    includedCreams: 3, // +3 cremes
    limits: { fruits: 3, toppings: 9, syrups: 3 },
  },
];

const INGREDIENTS = {
  /* emoji = ícone mostrado ao lado do nome.
     img (opcional) = caminho de uma foto, ex: img: "morango.jpg".
     Se tiver img, a foto aparece no lugar do emoji. */
  fruits: [
    { id: "morango", name: "Morango", emoji: "🍓" },
    { id: "banana", name: "Banana", emoji: "🍌" },
    { id: "uva", name: "Uva", emoji: "🍇" },
  ],
  toppings: [
    { id: "pacoca", name: "Paçoca" },
    { id: "ovomaltine", name: "Ovomaltine" },
    { id: "tubetes", name: "Tubetes" },
    { id: "granola", name: "Granola" },
    { id: "gotas-chocolate", name: "Gotas de Chocolate" },
    { id: "leite-po", name: "Leite em Pó" },
    { id: "mm", name: "M&M" },
    { id: "chocoball", name: "Chocoball" },
    { id: "marshmallow", name: "Marshmallow" },
    { id: "amendoim", name: "Amendoim" },
    { id: "mini-oreo", name: "Biscoito Mini Oreo" },
  ],
  syrups: [
    { id: "chocolate", name: "Chocolate" },
    { id: "morango-calda", name: "Morango" },
    { id: "leite-condensado", name: "Leite Condensado" },
    { id: "doce-leite", name: "Doce de Leite" },
  ],
  creams: [
    { id: "ninho", name: "Ninho Premium", price: 4 },
    { id: "nutella", name: "Creme Nutella", price: 4 },
    { id: "ninho-oreo", name: "Ninho c/ Oreo", price: 4 },
  ],
};

/* Grupos exibidos no cardápio */
const GROUPS = [
  {
    id: "copos",
    title: "Copos",
    img: "acai.png",
    badgeClass: "bg-brand-gold text-brand-purple",
    hoverClass: "hover:border-brand-gold/30",
  },
  {
    id: "bacias",
    title: "Bacias",
    img: "acai2.jpeg",
    badgeClass: "bg-brand-strawberry text-white",
    hoverClass: "hover:border-brand-strawberry/30",
  },
];
