const initialState = {
}

export default (state, action) => {
    if (!state) state = initialState
    if (action.component == "backgroundLocation") {
        switch (action.type) {
            case "onChange":
                onChange(state, action)
                break;
        }
        return { ...state }
    }
    return state
}

const onChange = (state, action) => {
    // console.log("Entro Reducer Onchange");
}