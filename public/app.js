// Navigation
const sections = document.querySelectorAll('.section');
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`${btn.dataset.section}-section`).classList.remove('hidden');
    if (btn.dataset.section === 'dashboard') loadSteps();
    if (btn.dataset.section === 'registre') loadRegistre();
    if (btn.dataset.section === 'dpia') loadDPIA();
    if (btn.dataset.section === 'legal') loadLegal();
  });
});

// Navigation smooth scroll
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// --- Registre des traitements ---
const registreSection = document.getElementById('registre');
registreSection.innerHTML = `
  <h2 class="text-xl font-semibold mb-4">Registre des traitements</h2>
  <form id="registre-form" class="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    <input required name="nom" placeholder="Nom du traitement" class="border p-2 rounded" />
    <input required name="finalite" placeholder="Finalité" class="border p-2 rounded" />
    <input required name="donnees" placeholder="Données collectées" class="border p-2 rounded" />
    <input required name="base" placeholder="Base légale (article)" class="border p-2 rounded" />
    <input required name="responsable" placeholder="Responsable de traitement" class="border p-2 rounded" />
    <input required name="securite" placeholder="Mesures de sécurité" class="border p-2 rounded" />
    <input required name="duree" placeholder="Durée de conservation" class="border p-2 rounded" />
    <button type="submit" class="bg-blue-900 text-white rounded p-2 col-span-1 md:col-span-2">Ajouter</button>
  </form>
  <div id="registre-list"></div>
`;

const registreForm = document.getElementById('registre-form');
const registreList = document.getElementById('registre-list');

function loadRegistre() {
  fetch('/api/registre').then(r => r.json()).then(data => {
    registreList.innerHTML = data.length ? `<table class="w-full text-sm"><thead><tr><th>Nom</th><th>Finalité</th><th>Données</th><th>Base légale</th><th>Responsable</th><th>Sécurité</th><th>Durée</th><th></th></tr></thead><tbody>${data.map(item => `
      <tr>
        <td><input value="${item.nom}" data-id="${item.id}" data-field="nom" class="border p-1 w-full" /></td>
        <td><input value="${item.finalite}" data-id="${item.id}" data-field="finalite" class="border p-1 w-full" /></td>
        <td><input value="${item.donnees}" data-id="${item.id}" data-field="donnees" class="border p-1 w-full" /></td>
        <td><input value="${item.base}" data-id="${item.id}" data-field="base" class="border p-1 w-full" /></td>
        <td><input value="${item.responsable}" data-id="${item.id}" data-field="responsable" class="border p-1 w-full" /></td>
        <td><input value="${item.securite}" data-id="${item.id}" data-field="securite" class="border p-1 w-full" /></td>
        <td><input value="${item.duree}" data-id="${item.id}" data-field="duree" class="border p-1 w-full" /></td>
        <td><button data-id="${item.id}" class="delete-registre bg-red-600 text-white rounded px-2">Supprimer</button></td>
      </tr>
    `).join('')}</tbody></table>` : '<div class="text-gray-500">Aucun traitement enregistré.</div>';
  });
}

registreForm.onsubmit = e => {
  e.preventDefault();
  const formData = new FormData(registreForm);
  const data = Object.fromEntries(formData.entries());
  fetch('/api/registre', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(() => {
    registreForm.reset();
    loadRegistre();
  });
};

registreList.addEventListener('click', e => {
  if (e.target.classList.contains('delete-registre')) {
    const id = e.target.getAttribute('data-id');
    fetch(`/api/registre/${id}`, { method: 'DELETE' }).then(loadRegistre);
  }
});

registreList.addEventListener('change', e => {
  if (e.target.tagName === 'INPUT') {
    const id = e.target.getAttribute('data-id');
    const field = e.target.getAttribute('data-field');
    const value = e.target.value;
    fetch(`/api/registre/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    }).then(loadRegistre);
  }
});

loadRegistre();

// --- DPIA ---
const dpiaSection = document.getElementById('dpia');
dpiaSection.innerHTML = `
  <h2 class="text-xl font-semibold mb-4">DPIA (Analyse d'impact)</h2>
  <form id="dpia-form" class="bg-white p-4 rounded shadow mb-4 flex flex-col gap-2">
    <textarea required name="scenario" placeholder="Décrivez le scénario de traitement..." class="border p-2 rounded"></textarea>
    <input name="details" placeholder="Détails complémentaires (facultatif)" class="border p-2 rounded" />
    <button type="submit" class="bg-blue-900 text-white rounded p-2">Analyser le risque</button>
  </form>
  <div id="dpia-result"></div>
`;

const dpiaForm = document.getElementById('dpia-form');
const dpiaResult = document.getElementById('dpia-result');

dpiaForm.onsubmit = e => {
  e.preventDefault();
  const formData = new FormData(dpiaForm);
  const data = Object.fromEntries(formData.entries());
  fetch('/api/dpia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(res => {
      dpiaResult.innerHTML = `<div class="p-4 rounded shadow bg-${res.risk === 'Élevé' ? 'red' : res.risk === 'Moyen' ? 'yellow' : 'green'}-100 text-${res.risk === 'Élevé' ? 'red' : res.risk === 'Moyen' ? 'yellow' : 'green'}-900">
        <b>Niveau de risque :</b> ${res.risk}<br/>
        ${res.notify ? '<b>Notification à la CNDP recommandée.</b>' : 'Notification à la CNDP non requise.'}
      </div>`;
    });
};

// --- Références légales ---
const legalSection = document.getElementById('legal');
fetch('/api/legal').then(r => r.json()).then(data => {
  legalSection.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Références légales</h2>
    <div class="bg-white p-4 rounded shadow mb-4">
      <b>Loi 09-08 :</b> <span>${data.loi}</span><br/>
      <b>Mission de la CNDP :</b> <span>${data.cndp}</span><br/>
      <b>Déclaration :</b> <span>${data.declaration}</span><br/>
      <b>Droits des citoyens :</b>
      <ul class="list-disc ml-6">
        ${data.droits.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>
    <div class="text-xs text-gray-500">Pour plus d'informations, consultez le site officiel de la <a href="https://www.cndp.ma/" class="text-blue-700 underline" target="_blank">CNDP</a>.</div>
  `;
}); 