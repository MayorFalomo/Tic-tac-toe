import axios from "axios";
import { useEffect, useState } from "react";

const useImageUpload = (files: FileList) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [successfulUpload, setSuccessfulUpload] = useState(false);

    useEffect(() => {
        if (files) {
            handleImageChange(files);
        }
    }, [files]);

    const handleImageChange = (files: FileList) => {
        const selectedImage = files[0];
        if (selectedImage) {
            uploadImage(selectedImage);
        }
    };

    const uploadImage = (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

        axios
            .post(`${ process.env.NEXT_PUBLIC_CLOUDINARY_PATH}/image/upload`, formData)
            .then((res) => {
                setImageUrl(res.data.url);
                setSuccessfulUpload(true);
            })
            .catch((err) => {
                console.log(err);
                setSuccessfulUpload(false);
            });
    };

    return { imageUrl, successfulUpload };
};

export default useImageUpload;
