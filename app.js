/* =========================================================
   ESTADO
========================================================= */
const state = {
  productId: DEFAULT_PRODUCT_ID,
  limits: { fruits: 0, toppings: 0, syrups: 0 },
  fruits: [],
  toppings: [],
  syrups: [],
  creams: {}, // { id: qty }
};

let cart = [];

/* =========================================================
   HELPERS
========================================================= */
const $ = (id) => document.getElementById(id);
const money = (v) => "R$ " + v.toFixed(2).replace(".", ",");
const plural = (n, one, many) => (n === 1 ? one : many);
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const ingName = (cat, id) =>
  (INGREDIENTS[cat].find((i) => i.id === id) || {}).name || id;
const creamPrice = (id) =>
  (INGREDIENTS.creams.find((i) => i.id === id) || {}).price || 0;

const totalCreams = () =>
  Object.values(state.creams).reduce((s, q) => s + q, 0);

/* Cremes incluídos no tamanho saem de graça (os mais caros primeiro) */
function creamsCost(product, creams) {
  const units = [];
  Object.entries(creams).forEach(([id, qty]) => {
    for (let i = 0; i < qty; i++) units.push(creamPrice(id));
  });
  units.sort((a, b) => b - a);
  return units.slice(product.includedCreams).reduce((s, p) => s + p, 0);
}

/* Divide os cremes escolhidos entre "incluso" (grátis) e "extra" (pago) */
function allocateCreams(product, creams) {
  let freeLeft = product.includedCreams;
  const out = {};
  Object.entries(creams)
    .sort((a, b) => creamPrice(b[0]) - creamPrice(a[0]))
    .forEach(([id, qty]) => {
      const free = Math.min(qty, freeLeft);
      freeLeft -= free;
      out[id] = { free, paid: qty - free };
    });
  return out;
}

const groupOf = (p) => GROUPS.find((g) => g.id === p.group);

const includedText = (n) =>
  n === 1 ? "1 creme incluso" : `${n} cremes inclusos`;

const creamLabel = (c) =>
  `${c.qty}x ${c.name}` +
  (c.free ? ` (${c.free} incluso${c.free > 1 ? "s" : ""})` : "");

/* Ícone do ingrediente: foto (img) ou emoji */
function ingIcon(it, size = "w-5 h-5") {
  if (it.img)
    return `<img src="${it.img}" alt="" class="${size} rounded-full object-cover shrink-0" />`;
  return it.emoji ? `<span class="shrink-0">${it.emoji}</span>` : "";
}

function currentTotal() {
  const p = getProduct(state.productId);
  return p ? p.price + creamsCost(p, state.creams) : 0;
}

function describeProduct(p) {
  const { fruits, toppings, syrups } = p.limits;
  const parts = [
    `${fruits} ${plural(fruits, "Fruta", "Frutas")}`,
    `${toppings} Acomp.`,
    `${syrups} ${plural(syrups, "Calda", "Caldas")}`,
  ];
  if (p.includedCreams)
    parts.push(
      `+${p.includedCreams} ${plural(p.includedCreams, "Creme", "Cremes")}`,
    );
  return parts.join(" • ");
}

/* =========================================================
   TOAST
========================================================= */
let toastTimer;
function toast(msg) {
  const el = $("toast");
  $("toast-msg").textContent = msg;
  el.classList.remove("opacity-0", "translate-y-4");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add("opacity-0", "translate-y-4");
  }, 2200);
}

/* =========================================================
   RENDER: PÁGINA (cardápio + ingredientes)
========================================================= */
function renderMenu() {
  $("menu-groups").innerHTML = GROUPS.map((g, gi) => {
    const cards = PRODUCTS.filter((p) => p.group === g.id)
      .map(
        (p, i) => `
        <div data-open-builder="${p.id}" style="transition-delay:${i * 100}ms"
          class="group cursor-pointer bg-brand-cream rounded-2xl sm:rounded-3xl p-2 sm:p-6 border border-brand-purple/5 ${g.hoverClass} hover:shadow-2xl transition-all duration-500 reveal flex flex-col">
          <div class="relative overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-6 bg-white">
            <img src="${g.img}" alt="${p.label}" loading="lazy"
              class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700" />
            <span class="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 bg-brand-purple/90 text-white font-poppins font-bold text-[10px] sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full shadow-sm">${p.size}</span>
            ${
              p.includedCreams
                ? `<span class="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 bg-gradient-to-r from-brand-gold to-amber-400 text-brand-purple font-poppins font-extrabold text-[8px] sm:text-xs text-center px-1 sm:px-2 py-1 sm:py-1.5 rounded-full shadow-lg leading-tight uppercase">🎁 ${includedText(p.includedCreams)}</span>`
                : ""
            }
          </div>
          <h4 class="font-poppins font-bold text-xs sm:text-xl text-brand-purple mb-1 sm:mb-2 leading-tight">${p.label}</h4>
          <p class="text-[10px] sm:text-sm text-brand-chocolate/70 mb-2 sm:mb-4 leading-tight flex-1">${describeProduct(p)}</p>
          <div class="flex items-center justify-between gap-1">
            <span class="font-poppins font-extrabold text-xs sm:text-2xl text-brand-purple">R$ ${p.price}<span class="hidden sm:inline">,00</span></span>
            <span class="w-6 h-6 sm:w-10 sm:h-10 bg-brand-gold text-brand-purple rounded-full flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors duration-300 shrink-0">
              <i data-lucide="plus" class="w-3 h-3 sm:w-5 sm:h-5"></i>
            </span>
          </div>
        </div>`,
      )
      .join("");

    return `
      <div class="${gi < GROUPS.length - 1 ? "mb-12 sm:mb-16" : ""}">
        <h3 class="font-poppins font-semibold text-lg sm:text-2xl text-brand-purple mb-5 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <span class="w-7 h-7 sm:w-8 sm:h-8 ${g.badgeClass} rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">${gi + 1}</span>
          ${g.title}
        </h3>
        <div class="menu-grid">${cards}</div>
      </div>`;
  }).join("");
}

function renderIngredientLists() {
  const dot = (color) =>
    `<span class="w-1.5 h-1.5 ${color} rounded-full shrink-0"></span>`;
  const simple = (items, color) =>
    items
      .map(
        (it) =>
          `<li class="flex items-center gap-2">${dot(color)}${it.name}</li>`,
      )
      .join("");

  $("list-fruits").innerHTML = simple(INGREDIENTS.fruits, "bg-brand-strawberry");
  $("list-toppings").innerHTML = simple(INGREDIENTS.toppings, "bg-brand-gold");
  $("list-syrups").innerHTML = simple(INGREDIENTS.syrups, "bg-brand-purple");
  $("list-creams").innerHTML = INGREDIENTS.creams
    .map(
      (c) => `
      <li class="flex items-center justify-between gap-2">
        <span class="flex items-center gap-2">${dot("bg-brand-chocolate")}${c.name}</span>
        <span class="font-poppins font-bold text-brand-purple whitespace-nowrap">${money(c.price)}</span>
      </li>`,
    )
    .join("");
}

/* =========================================================
   RENDER: BUILDER
========================================================= */
function renderProductButtons() {
  const build = (p) => {
    const active = state.productId === p.id;
    const g = groupOf(p);
    return `
      <button type="button" data-product="${p.id}"
        class="flex flex-col items-center text-center rounded-2xl border-2 p-2 sm:p-3 transition-all duration-200 ${
          active
            ? "border-brand-purple bg-brand-purple text-white shadow-lg"
            : "border-brand-purple/10 bg-white hover:border-brand-purple/40"
        }">
        <span class="w-full aspect-square max-w-[84px] rounded-xl bg-white overflow-hidden mb-1.5 flex items-center justify-center">
          <img src="${g.img}" alt="${p.label}" loading="lazy" class="w-full h-full object-contain" />
        </span>
        <span class="block font-poppins font-bold text-xs sm:text-sm ${
          active ? "text-white" : "text-brand-purple"
        }">${p.size}</span>
        <span class="block text-[10px] sm:text-xs mt-0.5 ${
          active ? "text-white/80" : "text-brand-chocolate/60"
        }">${money(p.price)}</span>
        ${
          p.includedCreams
            ? `<span class="mt-1.5 inline-block bg-brand-gold text-brand-purple font-poppins font-extrabold text-[8px] sm:text-[10px] leading-tight uppercase px-1.5 py-0.5 rounded-full">🎁 +${p.includedCreams} ${p.includedCreams === 1 ? "creme" : "cremes"}</span>`
            : `<span class="mt-1.5 block h-[14px]"></span>`
        }
      </button>`;
  };

  GROUPS.forEach((g) => {
    $("group-" + g.id).innerHTML = PRODUCTS.filter((p) => p.group === g.id)
      .map(build)
      .join("");
  });
}

function renderChips(cat) {
  const selected = state[cat];
  const limit = state.limits[cat];

  $("chips-" + cat).innerHTML = INGREDIENTS[cat]
    .map((it) => {
      const active = selected.includes(it.id);
      const disabled = !active && selected.length >= limit;
      return `
        <button type="button" data-chip-cat="${cat}" data-chip-id="${it.id}"
          class="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-xs sm:text-sm font-medium transition-all duration-200 ${
            active
              ? "bg-brand-purple text-white border-brand-purple shadow-md"
              : disabled
                ? "bg-white/60 text-brand-chocolate/30 border-brand-purple/5 cursor-not-allowed"
                : "bg-white text-brand-chocolate/80 border-brand-purple/10 hover:border-brand-purple/40 hover:-translate-y-0.5"
          }"><span class="inline-flex items-center gap-1.5">${ingIcon(it)}${it.name}</span></button>`;
    })
    .join("");

  const counter = $("count-" + cat);
  counter.textContent = `${selected.length}/${limit}`;
  counter.className =
    "text-xs font-poppins font-bold px-2.5 py-1 rounded-full " +
    (selected.length >= limit
      ? "bg-brand-strawberry/15 text-brand-strawberry"
      : "bg-brand-purple/10 text-brand-purple");
}

function renderCreams() {
  const p = getProduct(state.productId);
  const inc = p.includedCreams;
  const alloc = allocateCreams(p, state.creams);
  const used = Math.min(totalCreams(), inc);
  const extras = Math.max(0, totalCreams() - inc);

  $("count-creams").textContent = inc > 0 ? "" : "Opcional";

  // Banner de destaque do creme incluso
  if (inc > 0) {
    const dots = Array.from({ length: inc }, (_, i) =>
      i < used
        ? `<span class="w-7 h-7 rounded-full bg-brand-purple text-white flex items-center justify-center text-sm font-bold shadow">✓</span>`
        : `<span class="w-7 h-7 rounded-full border-2 border-dashed border-brand-purple/50 bg-white/60"></span>`,
    ).join("");
    $("creams-banner").innerHTML = `
      <div class="rounded-2xl bg-gradient-to-r from-brand-gold to-amber-300 p-4 shadow-lg ring-2 ring-brand-gold/60 mb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl leading-none">🎁</span>
          <div class="min-w-0 flex-1">
            <p class="font-poppins font-extrabold text-brand-purple text-sm sm:text-lg leading-tight uppercase">${includedText(inc)}!</p>
            <p class="text-xs sm:text-sm text-brand-purple/80 leading-snug">
              ${
                used < inc
                  ? `Escolha ${inc - used} ${plural(inc - used, "creme", "cremes")} abaixo — é por nossa conta.`
                  : `Seus ${plural(inc, "creme incluso já está", "cremes inclusos já estão")} escolhido${inc > 1 ? "s" : ""}.`
              }
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 mt-3">${dots}
          <span class="ml-auto font-poppins font-bold text-xs sm:text-sm text-brand-purple">${used}/${inc} incluso${inc > 1 ? "s" : ""}${extras ? ` • +${extras} extra${extras > 1 ? "s" : ""}` : ""}</span>
        </div>
      </div>`;
  } else {
    $("creams-banner").innerHTML = "";
  }

  $("creams-note").textContent =
    inc > 0 ? "Cremes além dos inclusos: R$ 4,00 cada." : "R$ 4,00 cada.";

  $("creams-list").innerHTML = INGREDIENTS.creams
    .map((it) => {
      const qty = state.creams[it.id] || 0;
      const a = alloc[it.id] || { free: 0, paid: 0 };
      const tags = [];
      if (a.free)
        tags.push(
          `<span class="bg-brand-gold text-brand-purple font-poppins font-extrabold text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded-full">🎁 ${a.free} incluso${a.free > 1 ? "s" : ""}</span>`,
        );
      if (a.paid)
        tags.push(
          `<span class="bg-brand-strawberry/15 text-brand-strawberry font-poppins font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">${a.paid} extra${a.paid > 1 ? "s" : ""} • ${money(a.paid * it.price)}</span>`,
        );
      return `
        <div class="flex items-center justify-between gap-2 bg-white rounded-2xl px-3 sm:px-4 py-3 border-2 transition-colors ${
          qty > 0 ? "border-brand-gold" : "border-brand-purple/10"
        }">
          <div class="min-w-0">
            <p class="font-medium text-brand-chocolate text-xs sm:text-sm truncate">${it.name}</p>
            <div class="flex flex-wrap items-center gap-1 mt-0.5">
              ${
                tags.length
                  ? tags.join("")
                  : `<span class="text-[10px] sm:text-xs text-brand-chocolate/60">${inc > 0 ? "incluso ou + " + money(it.price) : "+ " + money(it.price)}</span>`
              }
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" data-cream-dec="${it.id}"
              class="w-8 h-8 rounded-full border border-brand-purple/15 text-brand-purple font-bold leading-none hover:bg-brand-purple/5 transition-colors">−</button>
            <span class="w-6 text-center font-poppins font-bold text-brand-purple">${qty}</span>
            <button type="button" data-cream-inc="${it.id}"
              class="w-8 h-8 rounded-full bg-brand-gold text-brand-purple font-bold leading-none hover:bg-brand-purple hover:text-white transition-colors">+</button>
          </div>
        </div>`;
    })
    .join("");
}

/* Prévia com foto do tamanho escolhido */
function renderPreview() {
  const p = getProduct(state.productId);
  const g = groupOf(p);
  const l = p.limits;
  $("builder-preview").innerHTML = `
    <div class="flex items-center gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 border border-brand-purple/10 shadow-sm">
      <div class="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-white border border-brand-purple/10 overflow-hidden shrink-0 flex items-center justify-center">
        <img src="${g.img}" alt="${p.label}" class="w-full h-full object-contain" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[10px] sm:text-xs font-poppins font-semibold text-brand-chocolate/50 uppercase tracking-wide">Você escolheu</p>
        <p class="font-poppins font-extrabold text-lg sm:text-2xl text-brand-purple leading-tight">${p.label}</p>
        <p class="font-poppins font-bold text-brand-strawberry text-sm sm:text-lg">${money(p.price)}</p>
        <p class="text-[11px] sm:text-sm text-brand-chocolate/70 leading-snug mt-0.5">
          ${l.fruits} ${plural(l.fruits, "fruta", "frutas")} • ${l.toppings} acomp. • ${l.syrups} ${plural(l.syrups, "calda", "caldas")}
        </p>
        ${
          p.includedCreams
            ? `<span class="mt-1.5 inline-block bg-gradient-to-r from-brand-gold to-amber-400 text-brand-purple font-poppins font-extrabold text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-full shadow">🎁 ${includedText(p.includedCreams)}</span>`
            : ""
        }
      </div>
    </div>`;
}

function renderBuilder() {
  const p = getProduct(state.productId);
  renderPreview();
  renderProductButtons();
  ["fruits", "toppings", "syrups"].forEach(renderChips);
  renderCreams();

  const l = p.limits;
  $("builder-subtitle").textContent =
    `${p.label} • ${l.fruits} ${plural(l.fruits, "fruta", "frutas")}, ` +
    `${l.toppings} acomp., ${l.syrups} ${plural(l.syrups, "calda", "caldas")}`;
  $("builder-total").textContent = money(currentTotal());

  if (window.lucide) lucide.createIcons();
}

/* =========================================================
   LÓGICA DO BUILDER
========================================================= */
function setProduct(id) {
  const p = getProduct(id);
  if (!p) return;

  state.productId = id;
  state.limits = { ...p.limits };

  ["fruits", "toppings", "syrups"].forEach((k) => {
    if (state[k].length > state.limits[k]) {
      state[k] = state[k].slice(0, state.limits[k]);
    }
  });

  renderBuilder();
}

function toggleIngredient(cat, id) {
  const arr = state[cat];
  const idx = arr.indexOf(id);

  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    if (arr.length >= state.limits[cat]) {
      toast("Limite atingido para esta categoria 😉");
      const counter = $("count-" + cat);
      counter.classList.add("shake");
      setTimeout(() => counter.classList.remove("shake"), 320);
      return;
    }
    arr.push(id);
  }
  renderBuilder();
}

function changeCream(id, delta) {
  const next = Math.max(0, Math.min(10, (state.creams[id] || 0) + delta));
  if (next === 0) delete state.creams[id];
  else state.creams[id] = next;
  renderBuilder();
}

function resetSelections() {
  state.fruits = [];
  state.toppings = [];
  state.syrups = [];
  state.creams = {};
}

/* =========================================================
   CARRINHO
========================================================= */
function addToCart() {
  const p = getProduct(state.productId);
  if (!p) return;

  cart.push({
    uid: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    productId: p.id,
    label: p.label,
    qty: 1,
    unitPrice: currentTotal(),
    fruits: state.fruits.map((id) => ingName("fruits", id)),
    toppings: state.toppings.map((id) => ingName("toppings", id)),
    syrups: state.syrups.map((id) => ingName("syrups", id)),
    includedCreams: p.includedCreams,
    creams: (() => {
      const alloc = allocateCreams(p, state.creams);
      return Object.entries(state.creams).map(([id, qty]) => ({
        name: ingName("creams", id),
        qty,
        free: alloc[id].free,
      }));
    })(),
  });

  renderCart();
  closeBuilder();
  setTimeout(openCart, 260);
  toast("Adicionado ao carrinho! 🍨");

  resetSelections();
  renderBuilder();
}

function renderCart() {
  const container = $("cart-items");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-brand-purple/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="ice-cream" class="w-8 h-8 text-brand-purple/40"></i>
        </div>
        <p class="font-poppins font-semibold text-brand-purple">Seu carrinho está vazio</p>
        <p class="text-sm text-brand-chocolate/60 mt-1">Monte um açaí delicioso para começar.</p>
      </div>`;
  } else {
    container.innerHTML = cart
      .map((item) => {
        const details = [];
        if (item.fruits.length)
          details.push(`<b>Frutas:</b> ${item.fruits.join(", ")}`);
        if (item.toppings.length)
          details.push(`<b>Acomp.:</b> ${item.toppings.join(", ")}`);
        if (item.syrups.length)
          details.push(`<b>Caldas:</b> ${item.syrups.join(", ")}`);
        if (item.creams.length)
          details.push(
            `<b>Cremes:</b> ${item.creams.map(creamLabel).join(", ")}`,
          );

        return `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-brand-purple/5">
            <div class="flex justify-between gap-3">
              <div class="min-w-0">
                <p class="font-poppins font-semibold text-brand-purple">${item.label}</p>
                ${
                  details.length
                    ? `<p class="text-xs text-brand-chocolate/60 mt-1.5 leading-relaxed">${details.join("<br>")}</p>`
                    : `<p class="text-xs text-brand-chocolate/40 mt-1.5 italic">Sem adicionais</p>`
                }
              </div>
              <p class="font-poppins font-bold text-brand-purple text-right shrink-0">${money(item.unitPrice * item.qty)}</p>
            </div>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-brand-purple/5">
              <div class="flex items-center gap-2">
                <button type="button" data-cart-dec="${item.uid}"
                  class="w-8 h-8 rounded-full border border-brand-purple/15 text-brand-purple font-bold leading-none hover:bg-brand-purple/5 transition-colors">−</button>
                <span class="w-6 text-center text-sm font-poppins font-bold text-brand-purple">${item.qty}</span>
                <button type="button" data-cart-inc="${item.uid}"
                  class="w-8 h-8 rounded-full border border-brand-purple/15 text-brand-purple font-bold leading-none hover:bg-brand-purple/5 transition-colors">+</button>
              </div>
              <button type="button" data-cart-remove="${item.uid}"
                class="text-xs font-medium text-brand-strawberry hover:underline">Remover</button>
            </div>
          </div>`;
      })
      .join("");
  }

  $("cart-total").textContent = money(cartTotal());
  $("checkout-btn").disabled = cart.length === 0;

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = $("cart-badge");
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";

  if (window.lucide) lucide.createIcons();
}

function changeCartQty(uid, delta) {
  const item = cart.find((i) => i.uid === uid);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.uid !== uid);
  renderCart();
}

function removeFromCart(uid) {
  cart = cart.filter((i) => i.uid !== uid);
  renderCart();
  toast("Item removido");
}

function cartTotal() {
  return cart.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
}

/* =========================================================
   WHATSAPP
========================================================= */
function buildWhatsAppMessage() {
  const lines = ["Olá! Quero fazer um pedido de *Açaí* 🍇", ""];

  cart.forEach((item) => {
    lines.push(
      `*${item.qty}x ${item.label}* — ${money(item.unitPrice * item.qty)}`,
    );
    if (item.fruits.length) lines.push(`   • Frutas: ${item.fruits.join(", ")}`);
    if (item.toppings.length)
      lines.push(`   • Acompanhamentos: ${item.toppings.join(", ")}`);
    if (item.syrups.length) lines.push(`   • Caldas: ${item.syrups.join(", ")}`);
    if (item.creams.length)
      lines.push(
        `   • Cremes: ${item.creams.map(creamLabel).join(", ")}`,
      );
    lines.push("");
  });

  lines.push(`*Total: ${money(cartTotal())}*`, "");
  lines.push("Aguardo a confirmação. Obrigado! 😊");
  return lines.join("\n");
}

function checkout() {
  if (cart.length === 0) return;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  window.open(url, "_blank");
}

/* =========================================================
   ABRIR / FECHAR
========================================================= */
const builderModal = $("builder-modal");
const builderCard = $("builder-card");
const cartDrawer = $("cart-drawer");
const cartPanel = $("cart-panel");

function updateBodyScroll() {
  const anyOpen =
    !builderModal.classList.contains("hidden") ||
    !cartDrawer.classList.contains("hidden");
  document.body.style.overflow = anyOpen ? "hidden" : "";
}

function openBuilder(productId) {
  if (productId && getProduct(productId)) setProduct(productId);
  else renderBuilder();

  builderModal.classList.remove("hidden");
  requestAnimationFrame(() => {
    builderCard.classList.remove("opacity-0", "scale-95");
  });
  updateBodyScroll();
}

function closeBuilder() {
  builderCard.classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    builderModal.classList.add("hidden");
    updateBodyScroll();
  }, 250);
}

function openCart() {
  renderCart();
  cartDrawer.classList.remove("hidden");
  requestAnimationFrame(() => {
    cartPanel.classList.remove("translate-x-full");
  });
  updateBodyScroll();
}

function closeCart() {
  cartPanel.classList.add("translate-x-full");
  setTimeout(() => {
    cartDrawer.classList.add("hidden");
    updateBodyScroll();
  }, 300);
}

/* =========================================================
   EVENTOS
========================================================= */
const mobileMenuBtn = $("mobile-menu-btn");
const mobileMenu = $("mobile-menu");

function setMobileMenu(open) {
  mobileMenu.classList.toggle("hidden", !open);
  mobileMenuBtn.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" class="w-6 h-6"></i>`;
  lucide.createIcons();
}

// Um único listener de clique (delegação)
document.addEventListener("click", (e) => {
  const t = e.target;

  const opener = t.closest("[data-open-builder]");
  if (opener) {
    e.preventDefault();
    setMobileMenu(false);
    openBuilder(opener.getAttribute("data-open-builder") || DEFAULT_PRODUCT_ID);
    return;
  }
  if (t.closest("[data-close-builder]")) return closeBuilder();
  if (t.closest("[data-close-cart]")) return closeCart();

  const prod = t.closest("[data-product]");
  if (prod) return setProduct(prod.getAttribute("data-product"));

  const chip = t.closest("[data-chip-cat]");
  if (chip)
    return toggleIngredient(
      chip.getAttribute("data-chip-cat"),
      chip.getAttribute("data-chip-id"),
    );

  const cInc = t.closest("[data-cream-inc]");
  if (cInc) return changeCream(cInc.getAttribute("data-cream-inc"), 1);
  const cDec = t.closest("[data-cream-dec]");
  if (cDec) return changeCream(cDec.getAttribute("data-cream-dec"), -1);

  const inc = t.closest("[data-cart-inc]");
  if (inc) return changeCartQty(inc.getAttribute("data-cart-inc"), 1);
  const dec = t.closest("[data-cart-dec]");
  if (dec) return changeCartQty(dec.getAttribute("data-cart-dec"), -1);
  const rem = t.closest("[data-cart-remove]");
  if (rem) return removeFromCart(rem.getAttribute("data-cart-remove"));

  // fecha o menu mobile ao clicar num link
  if (t.closest("#mobile-menu a")) setMobileMenu(false);
});

$("add-to-cart-btn").addEventListener("click", addToCart);
$("checkout-btn").addEventListener("click", checkout);
$("cart-fab").addEventListener("click", openCart);
mobileMenuBtn.addEventListener("click", () =>
  setMobileMenu(mobileMenu.classList.contains("hidden")),
);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!cartDrawer.classList.contains("hidden")) closeCart();
  else if (!builderModal.classList.contains("hidden")) closeBuilder();
});

// Navbar com sombra ao rolar
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("shadow-lg", window.scrollY > 50);
});

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
$("link-instagram").href = INSTAGRAM_URL;
$("link-whatsapp").href = `https://wa.me/${WHATSAPP_NUMBER}`;

renderMenu();
renderIngredientLists();
setProduct(DEFAULT_PRODUCT_ID);
renderCart();
lucide.createIcons();

// Animação de entrada ao rolar (depois de gerar os cards)
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
