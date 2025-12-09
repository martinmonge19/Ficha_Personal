// script.js
// Manejo de datos locales (localStorage) y edición de 3 cards.
// Si querés más cards, cambiar NUM_CARDS.
const NUM_CARDS = 3;
const LS_KEY = "martin_ficha_cards_v1";
const LS_PROFILE = "martin_ficha_profile_v1";

function qs(sel){ return document.querySelector(sel) }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }


 const btn = document.getElementById("toggle-mode");

    btn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            btn.innerText = "Modo claro";
        } else {
            btn.innerText = "Modo oscuro";
        }
    });
    
function defaultProfile(){
  return {
    name: "Martin Mongelos",
    legajo: "1223475",
    materia: "Diseño y desarrollo web",
    curso: "",
    photoDataUrl: "" // si subís una foto se guarda aquí
  };
}

function defaultCards(){
  // cada card: { title, imgDataUrl, link }
  const arr = [];
  for(let i=0;i<NUM_CARDS;i++){
    arr.push({ title: "", imgDataUrl: "", link: "" });
  }
  return arr;
}

function loadFromStorage(){
  let cards = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  if(!cards){ cards = defaultCards(); localStorage.setItem(LS_KEY, JSON.stringify(cards)); }

  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");
  if(!profile){ profile = defaultProfile(); localStorage.setItem(LS_PROFILE, JSON.stringify(profile)); }

  return { cards, profile };
}

function saveCards(cards){
  localStorage.setItem(LS_KEY, JSON.stringify(cards));
}

function saveProfile(profile){
  localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
}

function createCardElement(card, index){
  const el = document.createElement("article");
  el.className = "card";
  el.dataset.index = index;

  // Thumb (imagen o placeholder)
  const thumb = document.createElement("div");
  thumb.className = "thumb";
  if(card.imgDataUrl){
    const img = document.createElement("img");
    img.src = card.imgDataUrl;
    img.alt = card.title || `Proyecto ${index+1}`;
    thumb.appendChild(img);
  } else {
    thumb.textContent = "Sin imagen (subila o pegá una URL)";
  }
  el.appendChild(thumb);

  // title
  const h3 = document.createElement("h3");
  h3.textContent = card.title || `Proyecto ${index+1}`;
  el.appendChild(h3);

  // link
  const link = document.createElement("a");
  link.className = "project-link";
  link.href = card.link || "#";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = card.link ? card.link : "Aún no hay link";
  el.appendChild(link);

  // inline form (hidden by default)
  const form = document.createElement("div");
  form.className = "form";
  form.style.display = "none";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Título del proyecto";
  titleInput.value = card.title || "";
  form.appendChild(titleInput);

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.placeholder = "Link del proyecto (https://...)";
  urlInput.value = card.link || "";
  form.appendChild(urlInput);

  const imgInputLabel = document.createElement("label");
  imgInputLabel.className = "small";
  imgInputLabel.textContent = "Subir imagen (archivo local) o pegar URL abajo";
  form.appendChild(imgInputLabel);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  form.appendChild(fileInput);

  const imgUrlInput = document.createElement("input");
  imgUrlInput.type = "url";
  imgUrlInput.placeholder = "URL de imagen (opcional)";
  imgUrlInput.value = "";
  form.appendChild(imgUrlInput);

  // controls
  const controls = document.createElement("div");
  controls.className = "controls";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn";
  toggleBtn.textContent = "Editar";
  controls.appendChild(toggleBtn);

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn primary";
  saveBtn.textContent = "Guardar";
  controls.appendChild(saveBtn);

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn";
  clearBtn.textContent = "Borrar";
  controls.appendChild(clearBtn);

  form.appendChild(controls);
  el.appendChild(form);

  // event: toggle edit
  toggleBtn.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "flex" : "none";
  });

  // event: save changes
  saveBtn.addEventListener("click", () => {
    // prefer file -> imgUrl -> keep existing
    const title = titleInput.value.trim();
    const linkVal = urlInput.value.trim();
    const imgUrlVal = imgUrlInput.value.trim();

    // handle file input if present
    if(fileInput.files && fileInput.files[0]){
      const f = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        applyCardSave(index, { title, link: linkVal, imgDataUrl: dataUrl });
        renderAll();
      };
      reader.readAsDataURL(f);
    } else if(imgUrlVal){
      applyCardSave(index, { title, link: linkVal, imgDataUrl: imgUrlVal });
      renderAll();
    } else {
      // no new image, just update title/link or keep same image
      applyCardSave(index, { title, link: linkVal, imgDataUrl: null });
      renderAll();
    }
    form.style.display = "none";
  });

  // event: clear
  clearBtn.addEventListener("click", () => {
    if(confirm("Borrar título, imagen y link de esta card?")){
      applyCardSave(index, { title: "", link: "", imgDataUrl: "" });
      renderAll();
    }
  });

  return el;
}

function applyCardSave(index, {title, link, imgDataUrl}){
  const data = loadFromStorage();
  const cards = data.cards;
  if(title !== undefined) cards[index].title = title || "";
  if(link !== undefined) cards[index].link = link || "";
  if(imgDataUrl !== undefined){
    if(imgDataUrl === null){
      // keep existing image
    } else {
      cards[index].imgDataUrl = imgDataUrl || "";
    }
  }
  saveCards(cards);
}

function renderAll(){
  const { cards, profile } = loadFromStorage();

  // profile photo
  const photoEl = document.getElementById("profilePhoto");
  if(profile.photoDataUrl) photoEl.src = profile.photoDataUrl;
  else photoEl.src = "placeholder-avatar.png";

  // profile fields
  document.getElementById("fullName").textContent = profile.name || "Martin Mongelos";
  document.getElementById("legajo").textContent = profile.legajo || "1223475";
  document.getElementById("materia").textContent = profile.materia || "Diseño y desarrollo web";
  document.getElementById("curso").textContent = profile.curso || "";

  // cards
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";
  for(let i=0;i<cards.length;i++){
    const cardEl = createCardElement(cards[i], i);
    container.appendChild(cardEl);
  }
}


function handleProfileUpload(){
  const input = document.getElementById("profilePhotoInput");
  input.addEventListener("change", (ev) => {
    const f = ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const { profile, cards } = loadFromStorage();
      profile.photoDataUrl = dataUrl;
      saveProfile(profile);
      renderAll();
    };
    reader.readAsDataURL(f);
  });
}


(function init(){
  
  const loaded = loadFromStorage();
  
  renderAll();
  handleProfileUpload();
})();

 

