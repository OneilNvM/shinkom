import { Shinkom } from 'shinkom'
import maincss from './main.css' with { type: "text" }

const run = () => {
    const shinkom = new Shinkom()

    shinkom.init()
    console.log(maincss)
}

run()