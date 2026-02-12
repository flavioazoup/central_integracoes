import { IPlatformAdapter } from './platform-adapter.interface'
import { PlatformProduct, PlatformOrder } from '../domain/entities'

/**
 * Adapter para Olist (Tiny ERP) - API 2.0
 * Documentação: https://tiny.com.br/api-docs
 */
export interface TinyConfig {
    token: string
    empresaId?: string // opcional; a API usa apenas o token para identificar a empresa
}

const TINY_BASE = 'https://api.tiny.com.br/api2'

function parseDecimal(val: unknown): number {
    if (typeof val === 'number' && Number.isFinite(val)) return val
    const n = parseFloat(String(val ?? '0').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
}

type Row = { produto: Record<string, unknown> }

function mapRowToVariant(row: Row, fallbackId: string): { id: string; sku: string; price: number; stock: number; attributes: Record<string, string> } {
    const p = row.produto
    const id = String(p.id ?? fallbackId)
    const codigo = String(p.codigo ?? '')
    const preco = parseDecimal(p.preco ?? p.preco_promocional ?? 0)
    const grade = p.grade as Array<{ tipo?: string; valor?: string }> | undefined
    const attributes: Record<string, string> = {}
    if (Array.isArray(grade)) {
        for (const g of grade) {
            const t = g.tipo ?? 'attr'
            const v = g.valor ?? ''
            if (t && v) attributes[t] = v
        }
    }
    return { id, sku: codigo, price: preco, stock: 0, attributes }
}

function parseTinyDate(dateStr: string | undefined): Date {
    if (!dateStr) return new Date()
    // Tiny usa dd/mm/yyyy ou dd/mm/yyyy hh:mm:ss
    const [d, m, y] = dateStr.split(/[/\s]/)
    if (y && m && d) {
        const parsed = new Date(Number(y), Number(m) - 1, Number(d))
        if (Number.isFinite(parsed.getTime())) return parsed
    }
    return new Date(dateStr)
}

export class TinyAdapter implements IPlatformAdapter {
    platformName = 'tiny'
    private config: TinyConfig

    constructor(config: TinyConfig) {
        this.config = config
    }

    private async post(endpoint: string, body: Record<string, string | number>) {
        const params = new URLSearchParams({
            token: this.config.token,
            formato: 'JSON',
            ...Object.fromEntries(
                Object.entries(body).map(([k, v]) => [k, String(v)])
            ),
        })
        const res = await fetch(`${TINY_BASE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        })
        if (!res.ok) {
            throw new Error(`Tiny API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        const ret = data.retorno
        if (ret?.status === 'Erro') {
            const msg = ret.erros?.map((e: { erro?: string }) => e.erro).join('; ') || ret.status
            throw new Error(`Tiny API: ${msg}`)
        }
        return ret
    }

    async validateConfig(config: unknown): Promise<void> {
        const cfg = config as TinyConfig
        if (!cfg?.token?.trim()) {
            throw new Error('Configuração Tiny/Olist inválida: token é obrigatório.')
        }
        // Validar com uma chamada leve (pesquisa de produtos com 1 item)
        const ret = await this.post('produtos.pesquisa.php', {
            pesquisa: ' ',
            pagina: 1,
        })
        if (ret.status !== 'OK' && ret.codigo_erro) {
            throw new Error(`Falha ao validar token Tiny: ${ret.erros?.[0]?.erro || 'Erro desconhecido'}`)
        }
    }

    async getProducts(options?: { page?: number; limit?: number }): Promise<PlatformProduct[]> {
        const page = options?.page ?? 1
        const ret = await this.post('produtos.pesquisa.php', {
            pesquisa: ' ',
            pagina: page,
        })

        const produtos = ret.produtos ?? []
        const list = Array.isArray(produtos) ? produtos : []

        // Suportar snake_case da API
        const getTipo = (p: Record<string, unknown>) =>
            String(p.tipoVariacao ?? (p as Record<string, unknown>).tipo_variacao ?? 'N')
        const getIdPai = (p: Record<string, unknown>) =>
            p.idProdutoPai != null ? String(p.idProdutoPai) : (p as Record<string, unknown>).id_produto_pai != null ? String((p as Record<string, unknown>).id_produto_pai) : null

        // Agrupar: V (variação) por idProdutoPai; N/P por id
        const byProductId = new Map<string, Row[]>()
        for (const item of list) {
            const p = (item as Row).produto || item
            const id = p.id != null ? String(p.id) : ''
            const tipo = getTipo(p)
            const idPai = getIdPai(p)
            const key = tipo === 'V' && idPai ? idPai : id
            if (!key) continue
            if (!byProductId.has(key)) byProductId.set(key, [])
            byProductId.get(key)!.push(item as Row)
        }

        const out: PlatformProduct[] = []
        for (const [, rows] of byProductId) {
            const first = rows[0].produto
            const productId = String(first.id ?? first.idProdutoPai ?? (first as Record<string, unknown>).id_produto_pai ?? '')
            const productName = String(first.nome ?? '')
            const tipoFirst = getTipo(first)

            let variants: Array<{ id: string; sku: string; price: number; stock: number; attributes: Record<string, string> }>

            if (tipoFirst === 'P' && first.id != null) {
                try {
                    const full = await this.post('produto.obter.php', { id: first.id })
                    const prod = full.produto
                    const variacoes = (prod?.variacoes ?? []) as Array<{ variacao?: Record<string, unknown> }>
                    variants = variacoes.map((entry) => {
                        const v = entry.variacao ?? entry
                        const id = String(v.id ?? '')
                        const codigo = String(v.codigo ?? '')
                        const preco = parseDecimal(v.preco)
                        const grade = v.grade as Array<{ tipo?: string; valor?: string }> | undefined
                        const attributes: Record<string, string> = {}
                        if (Array.isArray(grade)) {
                            for (const g of grade) {
                                const t = g.tipo ?? 'attr'
                                const val = g.valor ?? ''
                                if (t && val) attributes[t] = val
                            }
                        }
                        return { id, sku: codigo, price: preco, stock: 0, attributes }
                    })
                    if (variants.length === 0) {
                        variants = [{
                            id: productId,
                            sku: String(first.codigo ?? ''),
                            price: parseDecimal(first.preco ?? first.preco_promocional),
                            stock: 0,
                            attributes: {},
                        }]
                    }
                } catch {
                    variants = rows.map((row: Row) => mapRowToVariant(row, productId))
                }
            } else {
                variants = rows.map((row: Row) => mapRowToVariant(row, productId))
            }

            const firstV = variants[0]
            out.push({
                id: productId,
                name: productName,
                sku: firstV?.sku ?? '',
                price: firstV?.price ?? 0,
                stock: 0,
                description: undefined,
                images: [],
                variants: variants.length > 0 ? variants : [{ id: productId, sku: '', price: 0, stock: 0, attributes: {} }],
            })
        }
        return out
    }

    async getOrders(options?: {
        page?: number
        limit?: number
        status?: string
        createdAtMin?: Date
    }): Promise<PlatformOrder[]> {
        const page = options?.page ?? 1
        const createdAtMin = options?.createdAtMin ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        const dataFinal = new Date()
        const formatTiny = (d: Date) =>
            `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

        const ret = await this.post('pedidos.pesquisa.php', {
            dataInicial: formatTiny(createdAtMin),
            dataFinal: formatTiny(dataFinal),
            pagina: page,
        })

        const pedidos = ret.pedidos ?? []
        const list = Array.isArray(pedidos) ? pedidos : []

        const orders: PlatformOrder[] = []
        for (const item of list) {
            const ped = item.pedido || item
            const id = String(ped.id ?? ped.numero ?? '')
            const total = parseDecimal(ped.valor)
            const dataPedido = ped.data_pedido ? parseTinyDate(ped.data_pedido) : new Date()
            const nome = String(ped.nome ?? '')
            let itens: Array<{ sku: string; quantity: number; price: number }> = []
            let email = ''
            let document = ''
            try {
                const full = await this.post('pedido.obter.php', { id: ped.id ?? ped.numero })
                const pedidoFull = full.pedido
                if (pedidoFull?.itens?.length) {
                    itens = (pedidoFull.itens as Array<{ item?: Record<string, unknown> }>).map((entry) => {
                        const i = entry.item ?? entry
                        return {
                            sku: String(i.codigo ?? ''),
                            quantity: Number(i.quantidade) || 0,
                            price: parseDecimal(i.valor_unitario),
                        }
                    })
                }
                const cli = pedidoFull?.cliente
                if (cli) {
                    email = String(cli.email ?? '')
                    document = String(cli.cpf_cnpj ?? '')
                }
            } catch {
                // mantém itens vazio e email/document vazios se obter falhar
            }
            orders.push({
                id,
                customer: { name: nome, email, document },
                items: itens,
                status: String(ped.situacao ?? ''),
                total,
                createdAt: dataPedido,
            })
        }
        return orders
    }

    async updateStock(sku: string, quantity: number): Promise<void> {
        // API Tiny tem endpoint de alterar produto; estoque pode ser atualizado via produto.alterar ou similar
        throw new Error('Tiny/Olist: updateStock ainda não implementado. Use a API de alteração de produto se disponível.')
    }

    async syncProduct(product: PlatformProduct): Promise<void> {
        // API Tiny: produtos.incluir / produtos.alterar
        throw new Error('Tiny/Olist: syncProduct ainda não implementado.')
    }
}
