import assert from "node:assert";
import { validateContact, parseContact } from "../lib/contact.ts";

const bad = [
  ["telegram", "@@@"], ["telegram", "abc"], ["telegram", ""], ["telegram", "@shrt"],
  ["telegram", "@with-dash"], ["telegram", "@" + "a".repeat(33)],
  ["email", "abc"], ["email", "a@b"], ["email", "a@localhost"], ["email", "no at.com"],
  ["phone", "123"], ["phone", "abc"], ["phone", "+1"],
];
for (const [m, v] of bad) {
  const r = validateContact(m, v);
  assert.equal(r.ok, false, `мало б відхилити ${m}:${JSON.stringify(v)}`);
}

const good = [
  ["telegram", "@artem_dev", "@artem_dev"],
  ["telegram", "artem_dev", "@artem_dev"],
  ["telegram", "https://t.me/artem_dev", "@artem_dev"],
  ["telegram", "t.me/artem_dev?start=1", "@artem_dev"],
  ["email", "  Name@Example.COM ", "name@example.com"],
  ["email", "a.b+tag@mail.co.uk", "a.b+tag@mail.co.uk"],
  ["phone", "0671234567", "+380671234567"],
  ["phone", "+38 (067) 123-45-67", "+380671234567"],
  ["phone", "380671234567", "+380671234567"],
  ["phone", "+1 415 555 2671", "+14155552671"],
];
for (const [m, v, want] of good) {
  const r = validateContact(m, v);
  assert.ok(r.ok, `мало б прийняти ${m}:${v}`);
  assert.equal(r.value, want, `${m}:${v} -> ${r.value}, чекали ${want}`);
}

assert.equal(parseContact({ name: "Артем", contactMethod: "telegram", contact: "@@@" }).ok, false);
assert.equal(parseContact({ name: "", contactMethod: "email", contact: "a@b.com" }).ok, false);
assert.equal(parseContact({ name: "Артем", contactMethod: "sms", contact: "a@b.com" }).ok, false);
const okp = parseContact({ name: " Артем ", contactMethod: "email", contact: "A@B.com" });
assert.deepEqual(okp, { ok: true, name: "Артем", contactMethod: "email", contact: "a@b.com" });

console.log("контакти: усі перевірки пройшли");
