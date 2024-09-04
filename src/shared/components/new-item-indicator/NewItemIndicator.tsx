export const newItemIndicator = (isRecent: boolean) => {
    if (isRecent) {
        return (
            <div
                style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#014c98",
                    display: "inline-block",
                    verticalAlign: "middle"
                }}
            ></div>
        );
    }
}
