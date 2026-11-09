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
function card(name, value, extra) {
  return `<div class="card">${extra}<div class="card-body"><div class="name">${name}</div><div class="value">${String(value)}</div></div></div>`;
}
const colorEntries = entries.filter((e) => e.type === "color");
if (colorEntries.length) {
  section(
    "Color",
    `<div class="grid">${colorEntries.map((e) => card(e.path.join("."), e.value, `<div class="swatch-color" style="background:${e.value}"></div>`)).join("")}</div>`,
  );
}
const spaceEntries = entries.filter((e) => e.type === "dimension" && e.path[0] === "space");
if (spaceEntries.length) {
  section(
    "Space",
    `<div class="grid">${spaceEntries.map((e) => card(e.path.join("."), e.value, `<div class="space-bar" style="width:${e.value}"></div>`)).join("")}</div>`,
  );
}
const radiusEntries = entries.filter((e) => e.type === "dimension" && e.path[0] === "radius");
if (radiusEntries.length) {
  section(
    "Radius",
    `<div class="grid">${radiusEntries.map((e) => card(e.path.join("."), e.value, `<div class="radius-box" style="border-radius:${e.value}"></div>`)).join("")}</div>`,
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
      `<div class="type-sample" style="font-size:${e.value}">Aa Bb 0123</div>`,
    );
  inner += "</div>";
  section("Typography", inner);
}
const shadowEntries = entries.filter((e) => e.type === "shadow");
if (shadowEntries.length) {
  section(
    "Shadow",
    `<div class="grid">${shadowEntries.map((e) => card(e.path.join("."), e.value, `<div class="shadow-card" style="box-shadow:${e.value}"></div>`)).join("")}</div>`,
  );
}
const motionEntries = entries.filter((e) => e.type === "duration");
if (motionEntries.length) {
  section(
    "Motion",
    `<div class="grid">${motionEntries.map((e) => `<div class="card"><div class="card-body"><div class="name">${e.path.join(".")}</div><div class="value">${String(e.value)}</div><div class="motion-row"><div class="motion-dot"></div><span style="color:#a1a1aa;font-size:0.75rem">duration</span></div></div></div>`).join("")}</div>`,
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
document.querySelector(".meta").textContent = document
  .querySelector(".meta")
  .textContent.replace("· " + entries.length + " tokens", "· " + entries.length + " tokens");
