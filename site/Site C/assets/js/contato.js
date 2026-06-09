const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 7) {
            value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0,2)}) ${value.slice(2)}`;
        }
        e.target.value = value;
    });

    // 2. Lógica de envio direto para o WhatsApp
    const form = document.getElementById('contactForm');
    
    form.onsubmit = function(e) {
        e.preventDefault(); 

        const btn = document.getElementById('submitBtn');
        const nome = document.getElementById('name').value;
        const telefone = document.getElementById('phone').value;

        const meuNumero = "5511999999999"; 

        const mensagem = `Olá, GeTech! Gostaria de um *Orçamento Urgente*.%0A%0A` +
                        `*Nome/Empresa:* ${nome}%0A` +
                        `*Telefone:* ${telefone}`;

        const url = `https://wa.me/${meuNumero}?text=${mensagem}`;

        btn.innerText = "Abrindo WhatsApp...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        setTimeout(() => {
            window.open(url, '_blank');
            
            btn.innerText = "Solicitar Orçamento Urgente";
            btn.style.opacity = "1";
            btn.disabled = false;
        }, 800);
    };