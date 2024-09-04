// Assuming this code is part of a larger application

// Import your image file


const image = `${process.env.PUBLIC_URL}/ijg-header.jpg`;

// Function to get base64 image from URL
const getBase64ImageFromURL = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");

      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = url;
  });
};

// Function to generate brand logo
export const brandLogo = async () => {
  try {
    const dataURL = await getBase64ImageFromURL(image);

    return {
      // style: "brandLogo",
      dataURL: dataURL,
      fit: [76, 76],
    };
  } catch (error) {
    console.error("Error in brandLogo:", error);
    throw error; // Re-throw the error to propagate it
  }
};

// Function to generate footer stripes
export const footerStripes = async () => {
  try {
    const dataURL = await getBase64ImageFromURL(image);

    return {
      columns: [
        {
          dataURL: dataURL,
          width: 200,
          height: 60,
        },
      ],
    };
  } catch (error) {
    console.error("Error in footerStripes:", error);
    throw error; // Re-throw the error to propagate it
  }
};

// Example usage:
const renderImages = async () => {
  try {
    const brandLogoData = await brandLogo();
    console.log("Brand Logo Data:", brandLogoData);

    const footerStripesData = await footerStripes();
    console.log("Footer Stripes Data:", footerStripesData);

    // Use the generated image data as needed in your application
    // For example, you might render these images to a UI component
  } catch (error) {
    console.error("Error rendering images:", error);
  }
};

// Call the function to render images
renderImages();
