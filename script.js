const taxas = {
  ate20: {
    Visa:   [1.09, 3.14, 5.38, 6.07, 6.77, 7.48, 8.19, 8.67, 9.40, 10.13, 10.87, 11.62, 12.38, 13.59, 14.35, 15.13, 15.91, 16.69, 17.49],
    Master: [1.09, 3.14, 5.38, 6.07, 6.77, 7.48, 8.19, 8.67, 9.40, 10.13, 10.87, 11.62, 12.38, 13.59, 14.35, 15.13, 15.91, 16.69, 17.49],
    Elo:    [2.57, 4.91, 6.51, 7.19, 7.88, 8.58, 9.28, 9.99, 10.71, 11.43, 12.16, 12.90, 13.64, 14.84, 15.60, 16.36, 17.13, 17.90, 18.69]
  },
  mais20: {
    Visa:   [0.84, 2.88, 4.20, 4.79, 5.39, 5.99, 6.59, 6.96, 7.58, 8.20, 8.83, 9.46, 10.10, 11.19, 11.84, 12.49, 13.14, 13.80, 14.47],
    Master: [0.84, 2.88, 4.20, 4.79, 5.39, 5.99, 6.59, 6.96, 7.58, 8.20, 8.83, 9.46, 10.10, 11.19, 11.84, 12.49, 13.14, 13.80, 14.47],
    Elo:    [2.07, 4.64, 6.07, 6.65, 7.24, 7.83, 8.42, 8.78, 9.38, 9.99, 10.61, 11.23, 11.85, 12.94, 13.57, 14.21, 14.85, 15.50, 16.15]
  }
};

const form = document.getElementById("simulador-form");
const valorInput = document.getElementById("valor");
const resultados = document.getElementById("resultados");
const corpoResultado = document.getElementById("resultado-body");

const moeda = (numero) => numero.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const percentual = (numero) => `${numero.toFixed(2).replace(".", ",")}%`;

function calcularTaxaPortador(taxaEC) {
  const x = (100 * 100) / (100 - taxaEC);
  return x - 100;
}

function criarLinha(nome, taxa, valorParcela, valorLiberado) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${nome}</td>
    <td class="rate">${percentual(taxa)}</td>
    <td>${moeda(valorParcela)}</td>
    <td><strong>${moeda(valorLiberado)}</strong></td>
  `;
  return tr;
}

function criarSeparador(titulo) {
  const tr = document.createElement("tr");
  tr.className = "group-row";
  tr.innerHTML = `<td colspan="4">${titulo}</td>`;
  return tr;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const valor = Number(valorInput.value);
  const bandeira = document.getElementById("bandeira").value;
  const tipo = document.getElementById("tipo").value;
  const faixa = document.getElementById("faixa").value;

  if (!Number.isFinite(valor) || valor <= 0) {
    alert("Informe um valor válido maior que zero.");
    valorInput.focus();
    return;
  }

  const taxasBandeira = taxas[faixa][bandeira];
  const nomeFaixa = faixa === "ate20" ? "Até R$ 20 mil" : "Acima de R$ 20 mil";
  const nomeTipo = tipo === "EC" ? "EC" : "Portador";

  corpoResultado.replaceChildren();

  corpoResultado.appendChild(criarSeparador("Débito"));
  const taxaDebitoTabela = taxasBandeira[0];
  const taxaDebito = tipo === "EC"
    ? taxaDebitoTabela
    : calcularTaxaPortador(taxaDebitoTabela);

  const valorDebitoCobrado = tipo === "EC"
    ? valor
    : valor * (1 + taxaDebito / 100);
  const liberadoDebito = tipo === "EC"
    ? valor * (1 - taxaDebito / 100)
    : valor;

  corpoResultado.appendChild(
    criarLinha("Débito", taxaDebito, valorDebitoCobrado, liberadoDebito)
  );

  corpoResultado.appendChild(criarSeparador("Crédito"));
  for (let parcelas = 1; parcelas <= 18; parcelas++) {
    const taxaTabela = taxasBandeira[parcelas];
    const taxaAplicada = tipo === "EC"
      ? taxaTabela
      : calcularTaxaPortador(taxaTabela);

    const valorTotalCobrado = tipo === "EC"
      ? valor
      : valor * (1 + taxaAplicada / 100);

    const valorLiberado = tipo === "EC"
      ? valor * (1 - taxaAplicada / 100)
      : valor;

    corpoResultado.appendChild(
      criarLinha(
        `Crédito ${parcelas}x`,
        taxaAplicada,
        valorTotalCobrado / parcelas,
        valorLiberado
      )
    );
  }

  document.getElementById("resumo").textContent =
    `${bandeira} · ${nomeTipo} · ${nomeFaixa}`;
  document.getElementById("valor-resumo").textContent = moeda(valor);

  document.getElementById("nota-calculo").textContent = tipo === "EC"
    ? "EC: a taxa é descontada do valor informado. O valor da parcela considera a venda sem acréscimo; o valor liberado já considera o desconto da taxa."
    : "Portador: a taxa exibida segue a fórmula informada (x − 100) ÷ 10. O acréscimo é dividido entre as parcelas e o valor liberado corresponde ao valor original informado.";

  resultados.hidden = false;
  resultados.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("limpar").addEventListener("click", () => {
  form.reset();
  resultados.hidden = true;
  corpoResultado.replaceChildren();
  valorInput.focus();
});
