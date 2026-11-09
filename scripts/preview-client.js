function isToken(n) {
  return !!n && typeof n === "object" && "$value" in n;
}
function walk(n, path, out) {
  if (isToken(n)) {
    out.push({ path, type: n.$type || "", value: n.$value });
    return;
  }
  if (n && typeof n === "object") {
    for (const [k, v] of Object.entries(n)) {
      if (k.startsWith("$")) continue;
      walk(v, [...path, k], out);
    }
  }
}
const entries = [];
walk(tokens, [], entries);
const root = document.getElementById("root");
function section(title, inner) {
  const s = document.createElement("section");
  const h = document.createElement("h2");
  h.textContent = title;
  s.appendChild(h);
  s.insertAdjacentHTML("beforeend", inner);
  root.appendChild(s);
}
function colorCss(v) {
  if (typeof v === "string") return v;
  if (v && v.hex) return v.hex;
  if (v && Array.isArray(v.components)) {
    const [r, g, b] = v.components.map((c) => Math.round(c * 255));
    const a = typeof v.alpha === "number" ? v.alpha : 1;
    return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
  }
  return String(v);
}
function dimCss(v) {
  if (typeof v === "string") return v;
  if (v && "value" in v) {
    if (v.value === 0) return "0";
    return v.value + v.unit;
  }
  return String(v);
}
function durCss(v) {
  if (typeof v === "string") return v;
  if (v && "value" in v) return v.value + v.unit;
  return String(v);
}
function shadowCss(v) {
  if (typeof v === "string") return v;
  const c = colorCss(v.color);
  const ox = dimCss(v.offsetX);
  const oy = dimCss(v.offsetY);
  const blur = dimCss(v.blur);
  const spread = dimCss(v.spread);
  const inset = v.inset ? "inset " : "";
  return `${inset}${ox} ${oy} ${blur} ${spread} ${c}`.trim();
}
function card(name, value, extra) {
  return `<div class="card">${extra}<div class="card-body"><div class="name">${name}</div><div class="value">${String(typeof value === "object" ? JSON.stringify(value) : value)}</div></div></div>`;
}
const colorEntries = entries.filter((e) => e.type === "color");
if (colorEntries.length) {
  section(
    "Color",
    `<div class="grid">${colorEntries.map((e) => card(e.path.join("."), e.value, `<div class="swatch-color" style="background:${colorCss(e.value)}"></div>`)).join("")}</div>`,
  );
}
const spaceEntries = entries.filter((e) => e.type === "dimension" && e.path[0] === "space");
if (spaceEntries.length) {
  section(
    "Space",
    `<div class="grid">${spaceEntries.map((e) => card(e.path.join("."), e.value, `<div class="space-bar" style="width:${dimCss(e.value)}"></div>`)).join("")}</div>`,
  );
}
const radiusEntries = entries.filter((e) => e.type === "dimension" && e.path[0] === "radius");
if (radiusEntries.length) {
  section(
    "Radius",
    `<div class="grid">${radiusEntries.map((e) => card(e.path.join("."), e.value, `<div class="radius-box" style="border-radius:${dimCss(e.value)}"></div>`)).join("")}</div>`,
  );
}
const fontFamilies = entries.filter((e) => e.type === "fontFamily");
const fontSizes = entries.filter(
  (e) => e.type === "dimension" && e.path[0] === "font" && e.path[1] === "size",
);
if (fontFamilies.length || fontSizes.length) {
  let inner = '<div class="grid">';
  for (const e of fontFamilies)
    inner += card(
      e.path.join("."),
      e.value,
      `<div class="type-sample" style="font-family:${e.value};font-size:1.25rem">Aa Bb 0123</div>`,
    );
  for (const e of fontSizes)
    inner += card(
      e.path.join("."),
      e.value,
      `<div class="type-sample" style="font-size:${dimCss(e.value)}">Aa Bb 0123</div>`,
    );
  inner += "</div>";
  section("Typography", inner);
}
const shadowEntries = entries.filter((e) => e.type === "shadow");
if (shadowEntries.length) {
  section(
    "Shadow",
    `<div class="grid">${shadowEntries.map((e) => card(e.path.join("."), e.value, `<div class="shadow-card" style="box-shadow:${shadowCss(e.value)}"></div>`)).join("")}</div>`,
  );
}
const motionEntries = entries.filter((e) => e.type === "duration");
if (motionEntries.length) {
  section(
    "Motion",
    `<div class="grid">${motionEntries.map((e) => `<div class="card"><div class="card-body"><div class="name">${e.path.join(".")}</div><div class="value">${durCss(e.value)}</div><div class="motion-row"><div class="motion-dot"></div><span style="color:#a1a1aa;font-size:0.75rem">duration</span></div></div></div>`).join("")}</div>`,
  );
}
const rest = entries.filter(
  (e) =>
    ![
      ...colorEntries,
      ...spaceEntries,
      ...radiusEntries,
      ...fontFamilies,
      ...fontSizes,
      ...shadowEntries,
      ...motionEntries,
    ].includes(e),
);
if (rest.length) {
  section(
    "Other",
    `<div class="grid">${rest.map((e) => card(e.path.join("."), e.value, "")).join("")}</div>`,
  );
}
