# Como Iniciar o Worker de Sincronização

## Problema
Os jobs de sincronização ficam com status "pending" porque o worker BullMQ não está rodando para processá-los.

## Solução

### 1. Abra um novo terminal

### 2. Execute o worker:
```bash
cd /Users/flavioazoup/central_integracoes
npm run worker
```

### 3. Mantenha o terminal aberto
O worker precisa ficar rodando em background para processar os jobs de sincronização.

### 4. Agora você pode disparar sincronizações
- Vá para `/dashboard/integrations`
- Clique em "Sync Products" ou "Sync Orders"
- O worker irá processar automaticamente

## Verificação

### Ver logs do worker
O terminal do worker mostrará logs em tempo real:
```
Processing job xyz123
Fetching products from platform
Synced 10 products
Job xyz123 completed
```

### Ver status dos jobs
- Acesse `/dashboard/sync-status` para ver o status dos jobs
- Acesse `/dashboard/logs` para ver logs detalhados do sistema

### Ver dados importados
- `/dashboard/products` - Ver produtos importados
- `/dashboard/orders` - Ver pedidos importados

## Produção

Para produção, você deve usar um process manager como PM2:

```bash
npm install -g pm2
pm2 start npm --name "sync-worker" -- run worker
pm2 save
pm2 startup
```

Isso garantirá que o worker reinicie automaticamente se cair ou se o servidor reiniciar.
