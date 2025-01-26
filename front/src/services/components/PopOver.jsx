const PopOver = ({ data, position, isVisible }) => {
    if (!isVisible || !data) return null;

    // Styles du pop-up
    const popOverStyle = {
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "rgba(20, 20, 20, 0.95)", // Fond sombre translucide
        color: "#ffffff", // Texte blanc
        padding: "15px",
        borderRadius: "10px", // Coins arrondis
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)", // Ombre légère
        fontFamily: "'Arial', sans-serif",
        fontSize: "14px",
        lineHeight: "1.6",
        maxWidth: "300px", // Largeur maximale
        transform: "translate(-50%, -100%)", // Positionne au-dessus de la souris
        pointerEvents: "none", // Pas d'interaction avec la souris
        zIndex: 1000, // Par-dessus tout
    };

    const fieldStyle = {
        marginBottom: "8px",
        fontSize: "14px",
        textAlign: "left",
    };

    const boldStyle = {
        fontWeight: "bold",
        textTransform: "capitalize",
    };

    return (
        <div style={popOverStyle}>
            <div style={{ ...fieldStyle, fontSize: "16px", fontWeight: "bold", textAlign: "center" }}>
                {data.name || "Unnamed Star"}
            </div>
            <div style={fieldStyle}>
                Type: <span style={boldStyle}>{data.spect || "Unknown"}</span>
            </div>
            <div style={fieldStyle}>
                Mass: <span style={boldStyle}>{data.mass ? `${data.mass} Sun mass` : "Unknown"}</span>
            </div>
            <div style={fieldStyle}>
                Radius: <span style={boldStyle}>{data.radius ? `${data.radius} Sun radius` : "Unknown"}</span>
            </div>
            <div style={fieldStyle}>
                Luminosity: <span style={boldStyle}>{data.luminosity ? `${data.luminosity} Sun luminosity` : "Unknown"}</span>
            </div>
            <div style={fieldStyle}>
                Evolution sustaining: <span style={boldStyle}>{data.evolutionSustaining ? "true" : "false"}</span>
            </div>
            <div style={fieldStyle}>
                Constellation : <span style={boldStyle}>{data.cons ? "true" : "false"}</span>
            </div>
        </div>
    );
};

export default PopOver;
