import _ from 'lodash'

const translations = {
    en: {
        frontBlockedMsg: 'Front is blocked!',
        noStonesMsg: 'No stones to pick!'
    },
    pt: {
        frontBlockedMsg: 'Frente bloqueada!',
        noStonesMsg: 'Sem pedras para levar!'
    }
}
const lang = 'en'
const { frontBlockedMsg, noStonesMsg } = translations[lang]


const copy = data => _.cloneDeep(data)

function Karel(world) {
    world = copy(world)
    this.world = world

    const stonesAtLocation = (r, c) => world.stones.find(s => s.r === r && s.c === c)
    const wallAtLocation = (r, c, d) => world.walls.find(w => {
        //  equivalent wall location, but with West and South transformed to North and East
        const eq = {
            r: d === 'South' ? r + 1 : r,
            c: d === 'West' ? c - 1 : c,
            d: { West: 'East', South: 'North' }[d] || d
        }
        return w.r === eq.r && w.c === eq.c && w.d === eq.d
    })
    const stonesUnderKarel = () => stonesAtLocation(world.karelRow, world.karelCol)

    this.move = () => {
        if (!this.frontIsClear()) this.error = frontBlockedMsg
        else if (world.karelDir === 'North') world.karelRow -= 1
        else if (world.karelDir === 'South') world.karelRow += 1
        else if (world.karelDir === 'East') world.karelCol += 1
        else if (world.karelDir === 'West') world.karelCol -= 1
    }

    this.turnLeft = () => world.karelDir = { North: 'West', West: 'South', South: 'East', East: 'North' }[world.karelDir]

    this.pickStone = () => {
        if (!this.stonesPresent()) this.error = noStonesMsg
        else {
            world.pickedStones += 1
            stonesUnderKarel().n -= 1
            // don't allow stones when n < 1
            world.stones = world.stones.filter(s => s.n > 0)
        }
    }

    this.placeStone = () => {
        if (world.pickedStones === 0) this.error = 'Karel has no stones to place!'
        else {
            if (world.pickedStones) world.pickedStones -= 1
            const stones = stonesUnderKarel()
            if (!stones) world.stones.push({ r: world.karelRow, c: world.karelCol, n: 1 })
            else stones.n += 1
        }
    }

    this.frontIsClear = () => {
        if (world.karelDir === 'South' && world.karelRow === world.nRows - 1) return false
        if (world.karelDir === 'East' && world.karelCol === world.nCols - 1) return false
        if (world.karelDir === 'North' && world.karelRow === 0) return false
        if (world.karelDir === 'West' && world.karelCol === 0) return false
        return !wallAtLocation(world.karelRow, world.karelCol, world.karelDir)
    }

    this.stonesPresent = () => !!stonesUnderKarel()

    this.error = null

    return this
}

export default function KarelWorld(world, source) {
    const steps = [copy({
        openBlocks: {},
        world,
        error: null,
        isDone: false,
        step: 0
    })]
    let finalStep = Infinity

    //  TODO: validate world
    const openBlocks = {}
    const startBlock = id => openBlocks[id] = openBlocks[id] ? openBlocks[id] + 1 : 1
    const endBlock = id => openBlocks[id] -= 1
    const done = () => finalStep = steps.length //  this is called before the last step is added to steps since our implementation looks to the step ahead

    let resolveCurrentPromise = null
    const step = () => new Promise(resolve => resolveCurrentPromise = resolve)
    const karel = new Karel(world)

    //  functions is expected to be an object with keys corresponding to properly named
    //  async function definitions
    const runner = new Function('karel', 'start_block', 'end_block', 'step', 'done', source)

    //  start runner, will execute first step so that state is ready for the caller
    runner(karel, startBlock, endBlock, step, done)

    this.step = async (index) => {
        // return previously computed step
        if (steps[index]) return steps[index]

        if (index > steps.length) throw Error('New steps must be called for sequentialy')
        if (index > finalStep) throw Error('Cannot get step after the program has concluded')
        if (steps[steps.length - 1].error) throw Error('Cannot get step after an error!')

        const currentKarelWorldState = copy({
            openBlocks,
            activeBlocks: Object.keys(openBlocks).filter(k => openBlocks[k] > 0),
            world: karel.world,
            error: karel.error,
            isDone: finalStep === index,
            step: index
        })

        //  resolve current promise so the next KarelWorldState is ready for next call to step
        if (resolveCurrentPromise) resolveCurrentPromise()

        steps[index] = currentKarelWorldState
        return currentKarelWorldState
    }

    return this
}