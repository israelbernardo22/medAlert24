# Cenários de Uso — MedAlert

## Cenário 1 — Cadastro e primeiro acesso (Carlos)

**Persona:** Carlos, 38 anos  
**Situação:** Carlos acabou de instalar o MedAlert e quer configurar o sistema para a mãe.

**Passos:**
1. Carlos acessa o MedAlert e clica em "Criar Conta".
2. Preenche nome, email e senha e confirma o cadastro.
3. O sistema cria automaticamente um perfil "Titular" com seu nome.
4. Carlos clica em "Adicionar Novo Perfil" e cria um perfil para "Vovó Ana – Mãe".
5. Seleciona o perfil da mãe e clica no botão "+" para adicionar o primeiro medicamento: Losartana 50mg, todos os dias, às 08h e 20h, uso contínuo.
6. Adiciona o segundo medicamento: Metformina 850mg, todos os dias, às 12h, uso contínuo.
7. O dashboard já exibe os alertas do dia para o perfil da mãe.

**Resultado esperado:** Dois perfis ativos, medicamentos cadastrados, alertas configurados e dados salvos no servidor.

---

## Cenário 2 — Registro de dose diária (Maria)

**Persona:** Maria, 68 anos  
**Situação:** São 08h05 da manhã. Maria ouve o alerta do MedAlert.

**Passos:**
1. Maria vê o modal de alerta na tela: "Está na hora de tomar Losartana 50mg".
2. Ela vai buscar o remédio, toma com água e volta para o celular.
3. Toca no botão "Tomei" no modal.
4. O sistema registra a dose como "tomada" com o horário exato (08h05) e salva no banco de dados.
5. No dashboard, o ícone do medicamento muda para verde (concluído).

**Resultado esperado:** Histórico atualizado, dose marcada como tomada, confirmação visual na tela.

---

## Cenário 3 — Tratamento por período com antibiótico (Carlos para filha)

**Persona:** Carlos, 38 anos  
**Situação:** A filha de Carlos começou antibiótico hoje. O médico prescreveu Amoxicilina 250mg, uma vez ao dia por 10 dias.

**Passos:**
1. Carlos seleciona o perfil da filha "Sofia – Filha".
2. Clica em "+" e cadastra: Amoxicilina 250mg, todos os dias às 18h, duração: 10 dias a partir de hoje.
3. O sistema automaticamente para de gerar alertas após o 10º dia.
4. Carlos acompanha no dashboard quantos dias faltam para terminar o tratamento.
5. No 5º dia, Carlos viaja. A avó usa o app e marca a dose como tomada normalmente.

**Resultado esperado:** Tratamento controlado, doses registradas por qualquer usuário da conta, encerramento automático após 10 dias.

---

## Cenário 4 — Consulta ao histórico (Beatriz com Dr. Roberto)

**Persona:** Beatriz, 25 anos  
**Situação:** Beatriz tem consulta hoje com o Dr. Roberto para revisão do tratamento.

**Passos:**
1. Dr. Roberto pede para ver como está a aderência ao tratamento nas últimas semanas.
2. Beatriz abre o MedAlert, seleciona seu perfil e navega até "Histórico".
3. A tela exibe todas as doses dos últimos 30 dias: data, horário agendado, horário real de tomada, e status (tomada/perdida/reagendada).
4. Dr. Roberto observa que Beatriz perdeu 3 doses nas últimas 2 semanas, todas às 22h.
5. Com base nisso, o médico sugere mudar o horário noturno para 20h, que se encaixa melhor na rotina dela.
6. Carlos atualiza o medicamento no app com o novo horário.

**Resultado esperado:** Histórico completo e confiável exibido, decisão clínica baseada em dados reais de aderência.

---

## Cenário 5 — Dose adiada (Beatriz em aula)

**Persona:** Beatriz, 25 anos  
**Situação:** Beatriz está em uma prova às 14h quando recebe o alerta do MedAlert.

**Passos:**
1. O alerta aparece na tela: "Está na hora de tomar Hidroxicloroquina 400mg".
2. Beatriz não pode interromper a prova. Toca em "Adiar 30 minutos".
3. O sistema reagenda o alerta para 14h30.
4. Ao sair da prova às 14h20, ela recebe o novo alerta e toma o medicamento.
5. O histórico registra: horário agendado 14h00, tomado às 14h22 – status "reagendado".

**Resultado esperado:** Flexibilidade no uso, sem perda da dose, histórico fiel à realidade.
