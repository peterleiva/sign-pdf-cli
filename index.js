#!/usr/bin/env node
const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const { default: signer } = require("node-signpdf");
const { plainAddPlaceholder } = require("node-signpdf");

const argv = minimist(process.argv.slice(1), {
  h: { string: true },
});

const DEFAULT_OUT = path.resolve(__dirname);

const {
  h,
  help,
  out = DEFAULT_OUT,
  cert: certificate,
  password: passphrase,
  "contact-info": contactInfo,
  location,
  name,
  _: [bin, ...files],
} = argv;

function usage() {
  console.info(
    "usage %s --cert <p12-cer:tificate> --password <secret-passphrase> --contact-info [your-email] --name [name from p12] --location [location from p12] --out [path-to-save] <file>",
    path.basename(bin)
  );
}

if (h || help) {
  usage();
  process.exit(0);
}

if (!certificate || files.length <= 0 || !passphrase) {
  usage();
  process.exit(1);
}

const p12Buffer = fs.readFileSync(certificate);
let pdfBuffer = fs.readFileSync(files[0]);

pdfBuffer = plainAddPlaceholder({
  pdfBuffer,
  contactInfo,
  location,
  name,
});

const signedBuffer = signer.sign(pdfBuffer, p12Buffer, { passphrase });
const signedPdf = fs.createWriteStream(path.join(out, "signed.pdf"));
signedPdf.end(signedBuffer);
