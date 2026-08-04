document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId") || "guest";
  const storageKey = `evChargePaymentMethods:${userId}`;
  const paymentConfig = window.EV_PAYMENT_CONFIG || {};

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  const backBtn = document.getElementById("back-btn");
  const contactBtn = document.getElementById("contact-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const addCardBtn = document.getElementById("add-card-btn");
  const emptyAddBtn = document.getElementById("empty-add-btn");
  const cardList = document.getElementById("card-list");
  const emptyWallet = document.getElementById("empty-wallet");
  const cardCount = document.getElementById("card-count");
  const message = document.getElementById("payment-message");

  const cardModal = document.getElementById("card-modal");
  const cardModalClose = document.getElementById("card-modal-close");
  const cancelCardBtn = document.getElementById("cancel-card-btn");
  const cardForm = document.getElementById("card-form");
  const saveCardBtn = document.getElementById("save-card-btn");

  const nameInput = document.getElementById("cardholder-name");
  const numberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiry");
  const cvcInput = document.getElementById("card-cvc");
  const makeDefaultInput = document.getElementById("make-default");

  const previewName = document.getElementById("preview-name");
  const previewNumber = document.getElementById("preview-number");
  const previewExpiry = document.getElementById("preview-expiry");
  const previewBrand = document.getElementById("preview-brand");
  const detectedBrand = document.getElementById("detected-brand");

  const deleteModal = document.getElementById("delete-modal");
  const deleteDescription = document.getElementById("delete-description");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

  const paypalBtn = document.getElementById("paypal-btn");
  const paypalStatus = document.getElementById("paypal-status");
  const applePayBtn = document.getElementById("apple-pay-btn");
  const appleStatus = document.getElementById("apple-status");

  const providerModal = document.getElementById("provider-modal");
  const providerModalClose = document.getElementById("provider-modal-close");
  const providerModalCancel = document.getElementById("provider-modal-cancel");
  const providerModalBrand = document.getElementById("provider-modal-brand");
  const providerModalKicker = document.getElementById("provider-modal-kicker");
  const providerModalTitle = document.getElementById("provider-modal-title");
  const providerModalDescription = document.getElementById("provider-modal-description");
  const providerHandoffLogo = document.getElementById("provider-handoff-logo");
  const providerAssuranceTitle = document.getElementById("provider-assurance-title");
  const providerAssuranceText = document.getElementById("provider-assurance-text");
  const providerPrimaryLink = document.getElementById("provider-primary-link");
  const providerPrimaryLabel = document.getElementById("provider-primary-label");
  const providerExternalNote = document.getElementById("provider-external-note");

  const errorElements = {
    name: document.getElementById("cardholder-error"),
    number: document.getElementById("card-number-error"),
    expiry: document.getElementById("card-expiry-error"),
    cvc: document.getElementById("card-cvc-error")
  };

  const inputsByField = {
    name: nameInput,
    number: numberInput,
    expiry: expiryInput,
    cvc: cvcInput
  };

  let cards = loadCards();
  let pendingDeleteId = null;
  let lastFocusedElement = null;
  let messageTimer = null;
  let currentProvider = null;
  let applePaySupported = false;

  const allModals = [cardModal, providerModal, deleteModal].filter(Boolean);

  function getSafeExternalUrl(value, fallback) {
    try {
      const url = new URL(String(value || fallback));
      return url.protocol === "https:" ? url.href : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getSafeCard(card) {
    const allowedBrands = ["Visa", "Mastercard", "American Express", "Discover", "Card"];
    const brand = allowedBrands.includes(card?.brand) ? card.brand : "Card";
    const last4 = String(card?.last4 || "").replace(/\D/g, "").slice(-4);
    const expMonth = Number(card?.expMonth);
    const expYear = Number(card?.expYear);

    if (last4.length !== 4 || expMonth < 1 || expMonth > 12 || expYear < 2000 || expYear > 2200) {
      return null;
    }

    return {
      id: String(card.id || createId()),
      holderName: String(card.holderName || "Card holder").slice(0, 70),
      brand,
      last4,
      expMonth,
      expYear,
      isDefault: Boolean(card.isDefault)
    };
  }

  function loadCards() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(parsed)) return [];

      const safeCards = parsed.map(getSafeCard).filter(Boolean).slice(0, 10);
      if (safeCards.length && !safeCards.some((card) => card.isDefault)) {
        safeCards[0].isDefault = true;
      }
      return safeCards;
    } catch (error) {
      console.warn("Unable to load payment method metadata.", error);
      return [];
    }
  }

  function saveCards() {
    // Security rule: only masked card metadata is persisted in demo mode.
    // Never add a full card number or CVC to this object.
    const safeCards = cards.map((card) => ({
      id: card.id,
      holderName: card.holderName,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault
    }));

    localStorage.setItem(storageKey, JSON.stringify(safeCards));
  }

  function createId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showMessage(text, type = "info") {
    if (!message) return;

    if (messageTimer) window.clearTimeout(messageTimer);
    message.textContent = text;
    message.className = `payment-message is-${type}`;
    message.scrollIntoView({ behavior: "smooth", block: "nearest" });

    messageTimer = window.setTimeout(() => {
      message.textContent = "";
      message.className = "payment-message hidden";
    }, 6500);
  }

  function setFieldError(field, text = "") {
    const input = inputsByField[field];
    const error = errorElements[field];
    if (!input || !error) return;

    error.textContent = text;
    error.classList.toggle("hidden", !text);
    input.setAttribute("aria-invalid", text ? "true" : "false");
  }

  function clearErrors() {
    Object.keys(errorElements).forEach((field) => setFieldError(field));
  }

  function detectCardBrand(number) {
    const digits = String(number).replace(/\D/g, "");
    if (/^4/.test(digits)) return "Visa";
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "American Express";
    if (/^(6011|65|64[4-9])/.test(digits)) return "Discover";
    return "Card";
  }

  function getBrandLabel(brand) {
    const labels = {
      Visa: "VISA",
      Mastercard: "MC",
      "American Express": "AMEX",
      Discover: "DISC",
      Card: "CARD"
    };
    return labels[brand] || "CARD";
  }

  function isValidLuhn(number) {
    const digits = String(number).replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  function parseExpiry(value) {
    const match = String(value).match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return null;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) return null;
    return { month, year };
  }

  function validateForm() {
    clearErrors();
    let firstInvalid = null;

    const holderName = nameInput.value.trim().replace(/\s+/g, " ");
    const fullNumber = numberInput.value.replace(/\D/g, "");
    const brand = detectCardBrand(fullNumber);
    const expiry = parseExpiry(expiryInput.value);
    const cvc = cvcInput.value.replace(/\D/g, "");
    const expectedCvcLength = brand === "American Express" ? 4 : 3;

    if (holderName.length < 2) {
      setFieldError("name", "Enter the name shown on the card.");
      firstInvalid ||= nameInput;
    }

    if (!isValidLuhn(fullNumber)) {
      setFieldError("number", "Enter a valid card number. For testing, you can use 4242 4242 4242 4242.");
      firstInvalid ||= numberInput;
    }

    if (!expiry) {
      setFieldError("expiry", "Enter a future expiry date in MM/YY format.");
      firstInvalid ||= expiryInput;
    }

    if (cvc.length !== expectedCvcLength) {
      setFieldError("cvc", `Enter the ${expectedCvcLength}-digit security code.`);
      firstInvalid ||= cvcInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    return { holderName, fullNumber, brand, expiry };
  }

  function formatCardNumber(value) {
    const digits = String(value).replace(/\D/g, "").slice(0, 19);
    const brand = detectCardBrand(digits);
    const groups = brand === "American Express"
      ? [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      : digits.match(/.{1,4}/g) || [];
    return groups.filter(Boolean).join(" ");
  }

  function formatExpiry(value) {
    const digits = String(value).replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function updateCardPreview() {
    const brand = detectCardBrand(numberInput.value);
    const number = numberInput.value.trim();
    const name = nameInput.value.trim();
    const expiry = expiryInput.value.trim();

    previewBrand.textContent = getBrandLabel(brand);
    detectedBrand.textContent = getBrandLabel(brand);
    previewName.textContent = (name || "YOUR NAME").toUpperCase();
    previewExpiry.textContent = expiry || "MM/YY";

    if (!number) {
      previewNumber.textContent = "•••• •••• •••• ••••";
      return;
    }

    const digits = number.replace(/\D/g, "");
    const maskedDigits = digits
      .split("")
      .map((digit, index) => (index < digits.length - 4 ? "•" : digit))
      .join("");
    const previewGroups = brand === "American Express"
      ? [maskedDigits.slice(0, 4), maskedDigits.slice(4, 10), maskedDigits.slice(10, 15)]
      : maskedDigits.match(/.{1,4}/g) || [];
    previewNumber.textContent = previewGroups.filter(Boolean).join(" ");
  }

  function resetCardForm() {
    cardForm.reset();
    makeDefaultInput.checked = cards.length === 0;
    clearErrors();
    updateCardPreview();
    saveCardBtn.disabled = false;
    saveCardBtn.querySelector(".button-label").textContent = "Save card";
    saveCardBtn.querySelector(".button-loader").classList.add("hidden");
  }

  function getFocusableElements(modal) {
    return [...modal.querySelectorAll(
      "button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex='-1'])"
    )].filter((element) => !element.closest(".hidden"));
  }

  function openModal(modal, focusTarget) {
    lastFocusedElement = document.activeElement;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => (focusTarget || getFocusableElements(modal)[0])?.focus());
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    if (allModals.every((item) => item.classList.contains("hidden"))) {
      document.body.classList.remove("modal-open");
    }

    lastFocusedElement?.focus?.();
  }

  function renderCards() {
    cardList.replaceChildren();
    emptyWallet.classList.toggle("hidden", cards.length > 0);
    cardList.classList.toggle("hidden", cards.length === 0);
    cardCount.textContent = cards.length === 0
      ? "No cards saved"
      : `${cards.length} saved ${cards.length === 1 ? "card" : "cards"}`;

    const orderedCards = [...cards].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

    orderedCards.forEach((card) => {
      const article = document.createElement("article");
      article.className = `saved-card${card.isDefault ? " is-default" : ""}`;
      article.dataset.cardId = card.id;

      const brand = document.createElement("span");
      brand.className = "card-brand-tile";
      brand.textContent = getBrandLabel(card.brand);

      const details = document.createElement("div");
      details.className = "card-details";

      const title = document.createElement("h4");
      title.textContent = `${card.brand} •••• ${card.last4}`;

      if (card.isDefault) {
        const pill = document.createElement("span");
        pill.className = "default-pill";
        pill.textContent = "Default";
        title.appendChild(pill);
      }

      const description = document.createElement("p");
      description.textContent = `Expires ${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)} · ${card.holderName}`;
      details.append(title, description);

      const actions = document.createElement("div");
      actions.className = "card-actions";

      if (!card.isDefault) {
        const defaultBtn = document.createElement("button");
        defaultBtn.className = "card-action-btn";
        defaultBtn.type = "button";
        defaultBtn.dataset.action = "default";
        defaultBtn.textContent = "Make default";
        defaultBtn.setAttribute("aria-label", `Make ${card.brand} ending in ${card.last4} the default card`);
        actions.appendChild(defaultBtn);
      }

      const removeBtn = document.createElement("button");
      removeBtn.className = "card-action-btn remove";
      removeBtn.type = "button";
      removeBtn.dataset.action = "remove";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", `Remove ${card.brand} ending in ${card.last4}`);
      actions.appendChild(removeBtn);

      article.append(brand, details, actions);
      cardList.appendChild(article);
    });
  }

  function addCard(event) {
    event.preventDefault();
    const validCard = validateForm();
    if (!validCard) return;

    saveCardBtn.disabled = true;
    saveCardBtn.querySelector(".button-label").textContent = "Saving...";
    saveCardBtn.querySelector(".button-loader").classList.remove("hidden");

    const shouldBeDefault = cards.length === 0 || makeDefaultInput.checked;
    if (shouldBeDefault) cards.forEach((card) => { card.isDefault = false; });

    // The full card number and CVC are deliberately discarded here.
    // A production build must exchange them for a provider token using hosted fields.
    cards.push({
      id: createId(),
      holderName: validCard.holderName,
      brand: validCard.brand,
      last4: validCard.fullNumber.slice(-4),
      expMonth: validCard.expiry.month,
      expYear: validCard.expiry.year,
      isDefault: shouldBeDefault
    });

    saveCards();
    renderCards();
    resetCardForm();
    closeModal(cardModal);
    showMessage("Card added successfully. Only its masked details were saved in this demo.", "success");
  }

  function makeCardDefault(cardId) {
    const selectedCard = cards.find((card) => card.id === cardId);
    if (!selectedCard) return;

    cards.forEach((card) => { card.isDefault = card.id === cardId; });
    saveCards();
    renderCards();
    showMessage(`${selectedCard.brand} ending in ${selectedCard.last4} is now your default card.`, "success");
  }

  function requestCardRemoval(cardId) {
    const selectedCard = cards.find((card) => card.id === cardId);
    if (!selectedCard) return;

    pendingDeleteId = cardId;
    deleteDescription.textContent = `${selectedCard.brand} ending in ${selectedCard.last4} will no longer be available at checkout.`;
    openModal(deleteModal, cancelDeleteBtn);
  }

  function removePendingCard() {
    const removedCard = cards.find((card) => card.id === pendingDeleteId);
    if (!removedCard) {
      closeModal(deleteModal);
      return;
    }

    const wasDefault = removedCard.isDefault;
    cards = cards.filter((card) => card.id !== pendingDeleteId);
    if (wasDefault && cards.length) cards[0].isDefault = true;

    saveCards();
    renderCards();
    pendingDeleteId = null;
    closeModal(deleteModal);
    showMessage("Payment card removed.", "success");
  }

  function openProviderExperience(provider) {
    currentProvider = provider;

    if (provider === "paypal") {
      const paypalUrl = getSafeExternalUrl(
        paymentConfig.paypal?.officialUrl,
        "https://www.paypal.com/signin"
      );

      providerModalBrand.className = "provider-modal-brand is-paypal";
      providerModalBrand.textContent = "PayPal";
      providerModalKicker.textContent = "SECURE PAYPAL HANDOFF";
      providerModalTitle.textContent = "Continue to PayPal";
      providerModalDescription.textContent = "Sign in only on PayPal's official website. EV Charge will never ask for your PayPal password.";
      providerHandoffLogo.className = "handoff-stop is-paypal";
      providerHandoffLogo.textContent = "PayPal";
      providerAssuranceTitle.textContent = "Your PayPal sign-in stays private";
      providerAssuranceText.textContent = "The official PayPal page opens separately, so your credentials are never entered into EV Charge.";
      providerPrimaryLink.href = paypalUrl;
      providerPrimaryLabel.textContent = "Continue to PayPal";
      providerExternalNote.textContent = "Opens PayPal's official sign-in page in a new secure tab.";
    } else {
      const appleUrl = getSafeExternalUrl(
        paymentConfig.applePay?.officialUrl,
        "https://www.apple.com/apple-pay/"
      );

      providerModalBrand.className = "provider-modal-brand is-apple";
      providerModalBrand.textContent = "\uF8FF Pay";
      providerModalKicker.textContent = applePaySupported ? "AVAILABLE AT CHECKOUT" : "APPLE PAY AVAILABILITY";
      providerModalTitle.textContent = applePaySupported ? "Apple Pay is supported" : "Apple Pay is not available here";
      providerModalDescription.textContent = applePaySupported
        ? "This device can use Apple Pay. The payment sheet will appear during checkout after a reservation amount is ready."
        : "Apple Pay needs a compatible Apple device, a supported browser and an eligible card in Wallet.";
      providerHandoffLogo.className = "handoff-stop is-apple";
      providerHandoffLogo.textContent = "\uF8FF Pay";
      providerAssuranceTitle.textContent = "Your card stays in Apple Wallet";
      providerAssuranceText.textContent = "Apple Pay uses the device's secure payment sheet; EV Charge does not receive your full card number.";
      providerPrimaryLink.href = appleUrl;
      providerPrimaryLabel.textContent = "Learn about Apple Pay";
      providerExternalNote.textContent = "Opens Apple's official Apple Pay page in a new tab.";
    }

    openModal(providerModal, providerPrimaryLink);
  }

  function configureExpressPayments() {
    try {
      applePaySupported = Boolean(window.ApplePaySession && window.ApplePaySession.canMakePayments());
    } catch (error) {
      console.warn("Unable to check Apple Pay availability.", error);
    }

    if (applePaySupported) {
      appleStatus.textContent = "Supported on this device";
      appleStatus.classList.add("is-available");
      applePayBtn.setAttribute("aria-label", "Apple Pay is supported; view checkout information");
    } else {
      appleStatus.textContent = "Unavailable on this device";
      applePayBtn.classList.add("is-unavailable");
      applePayBtn.setAttribute("aria-label", "Learn more about Apple Pay availability");
    }

    paypalBtn?.addEventListener("click", () => openProviderExperience("paypal"));
    applePayBtn?.addEventListener("click", () => openProviderExperience("apple-pay"));
  }

  function returnToSettings() {
    let cameFromSettings = false;

    try {
      const previousUrl = new URL(document.referrer);
      cameFromSettings = previousUrl.origin === window.location.origin
        && previousUrl.pathname.endsWith("/Settings.html");
    } catch (error) {
      // A missing or invalid referrer simply means we use the safe fallback below.
    }

    if (cameFromSettings && window.history.length > 1) {
      window.history.back();
      return;
    }

    // Direct visits should still reach Settings without adding another history entry.
    window.location.replace("Settings.html");
  }

  backBtn?.addEventListener("click", returnToSettings);
  contactBtn?.addEventListener("click", () => { window.location.href = "Contact.html"; });
  settingsBtn?.addEventListener("click", () => { window.location.replace("Settings.html"); });

  [addCardBtn, emptyAddBtn].forEach((button) => {
    button?.addEventListener("click", () => {
      resetCardForm();
      openModal(cardModal, nameInput);
    });
  });

  [cardModalClose, cancelCardBtn].forEach((button) => {
    button?.addEventListener("click", () => closeModal(cardModal));
  });

  [providerModalClose, providerModalCancel].forEach((button) => {
    button?.addEventListener("click", () => closeModal(providerModal));
  });

  providerPrimaryLink?.addEventListener("click", () => {
    if (currentProvider === "paypal") {
      paypalStatus.textContent = "Demo opened — not linked";
      paypalStatus.classList.remove("is-available");
      showMessage("PayPal opened in a new tab. Demo mode does not link the account; the server integration will complete that step later.", "info");
    } else {
      showMessage(
        applePaySupported
          ? "Apple Pay is available on this device and will be used during checkout after the server is connected."
          : "Apple's official Apple Pay information opened in a new tab.",
        "info"
      );
    }

    closeModal(providerModal);
  });

  cancelDeleteBtn?.addEventListener("click", () => {
    pendingDeleteId = null;
    closeModal(deleteModal);
  });

  confirmDeleteBtn?.addEventListener("click", removePendingCard);
  cardForm?.addEventListener("submit", addCard);

  nameInput?.addEventListener("input", () => {
    setFieldError("name");
    updateCardPreview();
  });

  numberInput?.addEventListener("input", () => {
    numberInput.value = formatCardNumber(numberInput.value);
    numberInput.maxLength = detectCardBrand(numberInput.value) === "American Express" ? 17 : 23;
    cvcInput.maxLength = detectCardBrand(numberInput.value) === "American Express" ? 4 : 3;
    setFieldError("number");
    updateCardPreview();
  });

  expiryInput?.addEventListener("input", () => {
    expiryInput.value = formatExpiry(expiryInput.value);
    setFieldError("expiry");
    updateCardPreview();
  });

  cvcInput?.addEventListener("input", () => {
    cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, Number(cvcInput.maxLength));
    setFieldError("cvc");
  });

  cardList?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const cardId = actionButton.closest(".saved-card")?.dataset.cardId;
    if (!cardId) return;

    if (actionButton.dataset.action === "default") makeCardDefault(cardId);
    if (actionButton.dataset.action === "remove") requestCardRemoval(cardId);
  });

  allModals.forEach((modal) => {
    modal?.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      if (modal === deleteModal) pendingDeleteId = null;
      closeModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    const openModalElement = allModals.find((modal) => !modal.classList.contains("hidden"));
    if (!openModalElement) return;

    if (event.key === "Escape") {
      event.preventDefault();
      if (openModalElement === deleteModal) pendingDeleteId = null;
      closeModal(openModalElement);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(openModalElement);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelector(".logo-container")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = "MainMenu.html";
    }
  });

  renderCards();
  configureExpressPayments();
  updateCardPreview();
});
