import PriorityQueue from "./lib/PriorityQueue";
import redis from "redis";

const {promisify} = require('util');

module.exports = () => {
    const api = {};
    const client = redis.createClient(process.env.REDIS_URL);
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    const saddAsync = promisify(client.sadd).bind(client);
    const delAsync = promisify(client.del).bind(client);
    const sremAsync = promisify(client.srem).bind(client);
    const smembersAsync = promisify(client.smembers).bind(client);

    api.addEdge = async (u, v, value = 1) => {
        await setAsync(`${u}_${v}`, value);
        await saddAsync(u, v);
        // await saddAsync(v, u);
        await saddAsync('_all', u);
        await saddAsync('_all', v);
        console.log(`Added ${u} -> ${v} (${value})!`)
    };

    api.delEdge = async (u, v) => {
        await delAsync(`${u}_${v}`);
        await sremAsync(u, v);
        console.log(`Removed ${u} -> ${v}!`)
    };


    api.getVertex = async () => {
        return await smembersAsync('_all');
    };
    api.getNeighbours = async (u) => {
        return await smembersAsync(u);
    };

    api.getCost = async (u, v) => {
        return await getAsync(`${u}_${v}`);
    };

    api.dijkstra = async (startVertex, destVertex) => {
        const distances = {};
        const visitedVertices = {};
        const previousVertices = {};
        const queue = new PriorityQueue();

        // Init all distances with infinity assuming that currently we can't reach
        // any of the vertices except the start one.
        const vertices = await api.getVertex();
        vertices.forEach((vertex) => {
            distances[vertex] = Infinity;
            previousVertices[vertex] = null;
        });

        // We are already at the startVertex so the distance to it is zero.
        distances[startVertex] = 0;

        // Init vertices queue.
        queue.add(startVertex, distances[startVertex]);

        // Iterate over the priority queue of vertices until it is empty.
        while (!queue.isEmpty()) {
            // Fetch next closest vertex.
            const currentVertex = queue.poll();

            // Iterate over every unvisited neighbor of the current vertex.
            for (const neighbor of await api.getNeighbours(currentVertex)) {
                // Don't visit already visited vertices.
                if (!visitedVertices[neighbor]) {
                    // Update distances to every neighbor from current vertex.
                    const existingDistanceToNeighbor = distances[neighbor];
                    const distanceToNeighborFromCurrent = distances[currentVertex] + await api.getCost(currentVertex, neighbor);

                    // If we've found shorter path to the neighbor - update it.
                    if (distanceToNeighborFromCurrent < existingDistanceToNeighbor) {
                        distances[neighbor] = distanceToNeighborFromCurrent;

                        // Change priority of the neighbor in a queue since it might have became closer.
                        if (queue.hasValue(neighbor)) {
                            queue.changePriority(neighbor, distances[neighbor]);
                        }

                        // Remember previous closest vertex.
                        previousVertices[neighbor] = currentVertex;
                    }

                    // Add neighbor to the queue for further visiting.
                    if (!queue.hasValue(neighbor)) {
                        queue.add(neighbor, distances[neighbor]);
                    }
                }
            }

            // Add current vertex to visited ones to avoid visiting it again later.
            visitedVertices[currentVertex] = currentVertex;
        }

        const path = [];
        let current_vertex = destVertex;
        while (previousVertices[current_vertex] !== undefined) {
            path.push(current_vertex);
            current_vertex = previousVertices[current_vertex]
        }
        // Return the set of shortest distances to all vertices and the set of
        // shortest paths to all vertices in a graph.
        return {
            // distances,
            path,
            // previousVertices,
        };
    };

    // api.quit = () => new Promise(resolve => client.quit(resolve));
    return api;
};
