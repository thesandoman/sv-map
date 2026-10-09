import { test } from "node:test";
import assert from "node:assert/strict";
import { coordsFromMapUrl, inBounds, kmBetween, placeFor } from "../src/places.js";
import { BANGKOK_BOUNDS, BANGKOK_DISTRICTS, bangkokDistrict } from "../presets/bangkok.js";

test("map links: the shapes people paste", () => {
  assert.deepEqual(coordsFromMapUrl("https://www.google.com/maps/place/X/@13.7314,100.5414,17z"), { lat: 13.7314, lng: 100.5414 });
  assert.deepEqual(coordsFromMapUrl("https://www.google.com/maps/place/X/@13.70,100.50,15z/data=!3m1!4b1!4m6!3m5!3d13.7314!4d100.5414"), { lat: 13.7314, lng: 100.5414 });
  assert.deepEqual(coordsFromMapUrl("https://maps.google.com/?q=13.7563,100.5018"), { lat: 13.7563, lng: 100.5018 });
  assert.deepEqual(coordsFromMapUrl("https://www.openstreetmap.org/?mlat=13.7465&mlon=100.5348"), { lat: 13.7465, lng: 100.5348 });
  assert.deepEqual(coordsFromMapUrl("https://www.openstreetmap.org/#map=16/13.7465/100.5348"), { lat: 13.7465, lng: 100.5348 });
  assert.deepEqual(coordsFromMapUrl("https://maps.apple.com/?ll=13.7465,100.5348"), { lat: 13.7465, lng: 100.5348 });
});
test("map links: nothing usable gives null", () => {
  assert.equal(coordsFromMapUrl("https://maps.app.goo.gl/abc"), null);
  assert.equal(coordsFromMapUrl("https://www.google.com/maps/@18.7883,98.9853,14z", BANGKOK_BOUNDS), null);
  assert.deepEqual(coordsFromMapUrl("https://www.google.com/maps/@18.7883,98.9853,14z"), { lat: 18.7883, lng: 98.9853 });
  assert.equal(coordsFromMapUrl("not a url"), null);
  assert.equal(coordsFromMapUrl(null), null);
});
test("placeFor tries sources in order and never guesses", () => {
  const src = [["exact", (x) => coordsFromMapUrl(x.link, BANGKOK_BOUNDS)], ["area", (x) => bangkokDistrict(x.district) && [bangkokDistrict(x.district).lat, bangkokDistrict(x.district).lng]]];
  assert.equal(placeFor({ link: "https://maps.google.com/?q=13.73,100.54", district: "dusit" }, src).precision, "exact");
  assert.equal(placeFor({ link: null, district: "dusit" }, src).precision, "area");
  assert.equal(placeFor({ link: null, district: "wang_thonglang" }, src), null);
});
test("Bangkok preset: 50 districts, all inside Bangkok, found by id or name", () => {
  assert.equal(BANGKOK_DISTRICTS.length, 50);
  for (const d of BANGKOK_DISTRICTS) if (d.lat != null) assert.ok(inBounds(d.lat, d.lng, BANGKOK_BOUNDS), d.id);
  assert.equal(bangkokDistrict("เขตบางรัก").id, "bang_rak");
  assert.equal(bangkokDistrict("Bang Rak").id, "bang_rak");
});
test("kmBetween", () => {
  assert.ok(Math.abs(kmBetween({ lat: 13.7563, lng: 100.5018 }, { lat: 13.7314, lng: 100.5414 }) - 5.1) < 0.3);
});
