export const colorizeJson = (obj) => {
    let jsonString = JSON.stringify(obj, null, 2)

    jsonString = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    return jsonString.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/gm,
        function (match) {
            let classname = "json-number"

            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    classname = "json-key"
                } else {
                    classname = "json-string"
                }
            } else if (/true|false/.test(match)) {
                classname = "json-boolean"
            } else if (/null/.test(match)) {
                classname = "json-null"
            }

            return `<span class="${classname}">${match}</span>`
        }
    )
}