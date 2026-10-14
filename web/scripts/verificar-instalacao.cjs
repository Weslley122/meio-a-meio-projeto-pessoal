// Confere se as partes compiladas (.node) do Tailwind abrem de verdade.
// Uma instalação interrompida deixa esses arquivos pela metade, e o erro só aparece ao subir o Vite.
const pecas = ['lightningcss', '@tailwindcss/oxide'];
let falhou = false;
for (const nome of pecas) {
  try {
    require(nome);
    console.log(`ok     ${nome}`);
  } catch (e) {
    falhou = true;
    console.log(`FALHOU ${nome}: ${String(e.message).split('\n')[0]}`);
  }
}
try {
  require.resolve('vite');
  console.log('ok     vite');
} catch {
  falhou = true;
  console.log('FALHOU vite: nao instalado');
}
if (falhou) {
  console.log('Instalacao incompleta. Rode reinstalar.cmd.');
  process.exit(1);
}
console.log('Instalacao conferida.');
