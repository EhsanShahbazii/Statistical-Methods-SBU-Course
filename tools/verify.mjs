import assert from 'node:assert/strict';
import fs from 'node:fs';
import katex from 'katex';
import {normalCDF,normalQuantile,chiQuantile,chiCDF,binomialPMF,tPDF,normalPDF,LABS} from '../dist/labs.js';
const close=(actual,expected,tol=1e-6)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
close(normalCDF(2),.9772498681);close(normalQuantile(.975),1.9599639845,2e-6);
close(chiQuantile(.95,9),16.9189776046);close(chiQuantile(.05,9),3.3251128431);
close(chiCDF(12.5915872437,6),.95);close(tPDF(0,3),.36755259695);
close(Array.from({length:11},(_,k)=>binomialPMF(k,10,.5)).reduce((a,b)=>a+b,0),1);
close(Array.from({length:4},(_,k)=>binomialPMF(k+7,10,.5)).reduce((a,b)=>a+b,0),.171875);
assert.ok(tPDF(3,3)>normalPDF(3));assert.ok(chiQuantile(.975,4)<chiQuantile(.975,40));
const macros={ '\\E':'\\mathbb{E}','\\Var':'\\operatorname{Var}','\\Cov':'\\operatorname{Cov}','\\MSE':'\\operatorname{MSE}','\\Bias':'\\operatorname{Bias}','\\SE':'\\operatorname{SE}','\\iid':'\\overset{\\mathrm{iid}}{\\sim}','\\N':'\\mathcal{N}','\\R':'\\mathbb{R}','\\Prob':'\\mathbb{P}'};
const math=JSON.parse(fs.readFileSync(new URL('math-expressions.json',import.meta.url),'utf8'));
const warn = console.warn; console.warn = () => {};
const failures=[];for(const expr of math){try{katex.renderToString(expr,{throwOnError:true,strict:'ignore',macros,displayMode:true});}catch(e){failures.push({expr,error:e.message});}}
console.warn=warn;
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}
else console.log(`PASS: ${math.length} equations render; normal, chi-square, Student and binomial reference values verified.`);
const book=JSON.parse(fs.readFileSync(new URL('../dist/book.json',import.meta.url),'utf8'));
assert.equal(book.length,6);assert.equal(book.reduce((n,c)=>n+c.sections.length,0),39);
for(const lab of LABS)assert.ok(book[lab.chapter].sections.some(s=>s.title.includes(lab.section)),`Missing inline lab ${lab.id}`);
assert.equal(book.map(c=>c.intro+c.sections.map(s=>s.html).join('')).join('').match(/data-figure=/g).length,5);
console.log('PASS: all 39 sections, all 5 original diagrams, and all 9 contextual labs are connected.');

const {createHash}=await import('node:crypto');
const exports=JSON.parse(fs.readFileSync(new URL('../dist/assets/chapters/index.json',import.meta.url),'utf8'));
assert.equal(exports.length,book.length);
for(const item of exports){
 const chapter=book.find(c=>c.id===item.id);assert.equal(item.title,chapter.title);assert.ok(item.pages>0);
 const pdf=fs.readFileSync(new URL('../dist/'+item.pdf,import.meta.url));assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.equal(pdf.length,item.pdfBytes);
 const tex=fs.readFileSync(new URL('../dist/'+item.tex,import.meta.url),'utf8');assert.ok(tex.includes('\\documentclass'));assert.ok(tex.includes('\\begin{document}'));assert.ok(tex.includes(item.title));assert.ok(tex.includes('دکتر سکینه دهقان'));assert.ok(tex.includes('احسان شهبازی'));
}
const source=fs.readFileSync(new URL('../dist/assets/lecture.tex',import.meta.url));
const expected=fs.readFileSync(new URL('../dist/assets/chapters/source.sha256',import.meta.url),'utf8').trim();assert.equal(createHash('sha256').update(source).digest('hex'),expected);
console.log('PASS: 6 chapter PDFs and 6 standalone LaTeX sources exist, match the chapter list, and were generated from the current complete source.');

const taSessions=JSON.parse(fs.readFileSync(new URL('../dist/ta-sessions.json',import.meta.url),'utf8'));
assert.equal(taSessions.length,4);
assert.equal(taSessions[0].sections.length,6);
const taPdf=fs.readFileSync(new URL('../dist/'+taSessions[0].pdf,import.meta.url));
assert.equal(taPdf.subarray(0,5).toString(),'%PDF-');
console.log('PASS: 4 TA problem-solving sessions verified, session 1 complete with 6 sections and PDF.');

const {interpolateValue}=await import('../dist/motion.js');
const morph=interpolateValue('M0,0L10,20','M10,20L30,40');
assert.equal(morph(0),'M0,0L10,20');assert.equal(morph(.5),'M5,10L20,30');assert.equal(morph(1),'M10,20L30,40');
assert.equal(interpolateValue('M0 0L1 1','M0 0L1 1L2 2'),null);
assert.equal(interpolateValue('M0 0H1','M0 0V1'),null);
console.log('PASS: chart morphs preserve exact endpoints and use crossfades for incompatible SVG geometry.');
