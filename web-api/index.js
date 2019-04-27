const model = require('./model');

const main = async () => {
    const g = model();
    const Koa = require('koa');
    const Router = require('koa-router');
    const koaBody = require('koa-body');
    const app = new Koa();
    const router = new Router();

    router.post('/:start/:end', koaBody(), async (ctx) => {
        await g.addEdge(ctx.params.start, ctx.params.end, ctx.request.body.cost);
        ctx.status = 302;
    });

    router.get('/', async ctx => {
        ctx.body = await g.getVertex();
    });

    router.get('/:start',async (ctx) => {
        ctx.body = await g.getNeighbours(ctx.params.start);
    });

    router.get('/cost/:start/:end',async (ctx) => {
        ctx.body = {

        };
    });

    router.del('/:start/:end', async (ctx) => {
        await g.delEdge(ctx.params.start, ctx.params.end);
        ctx.status = 302;
    });

    router.del('/:start/:end', koaBody(), async (ctx) => {
        await g.delEdge(ctx.params.start, ctx.params.end);
        ctx.status = 302;
    });

    router.post('/demo', async (ctx, next) => {
        await g.addEdge(0, 4, 7);
        await g.addEdge(6, 4, 8);
        await g.addEdge(4, 2, 7);
        await g.addEdge(2, 6, 9);
        await g.addEdge(6, 2, 1);
        await g.addEdge(1, 6, 6);
        await g.addEdge(5, 6, 4);
        await g.addEdge(5, 3, 1);
        await g.addEdge(5, 7, 8);
        await g.addEdge(3, 7, 3);
        await g.addEdge(3, 1, 4);

        ctx.status = 302;
    });
    router.get('/:start/:end', async (ctx, next) => {
        const data = await g.dijkstra(ctx.params.start, ctx.params.end);

        ctx.body = {
            cost: await g.getCost(ctx.params.start, ctx.params.end),
            path: data.path
        }
    });

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.listen(3000, () => {
        console.log("Listening on port 3000")
    });

};

main().catch(err => {
    console.log(err);
    process.exit(-1);
});
