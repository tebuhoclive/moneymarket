import React, { useEffect, useState } from 'react';
import { database, onValue, ref } from '../../../../../shared/config/firebase-config';

interface IProps {
    jobId: string;
}

interface IProgress {
    totalAccounts: number;
    processedCount: number;
    status: string;
}

const ProgressTrackerCapitalisation: React.FC<IProps> = ({ jobId }) => {
    const [progress, setProgress] = useState<IProgress | null>(null);

    useEffect(() => {
        if (!jobId) return;

        const progressRef = ref(database, `progress-updates/${jobId}`);
        const unsubscribe = onValue(progressRef, (snapshot: { val: () => React.SetStateAction<IProgress | null>; }) => {
            setProgress(snapshot.val());
        });

        return () => {
            unsubscribe();
        };
    }, [jobId]);

    if (!progress) {
        return <div>Loading progress...</div>;
    }

    return (
        <div>
            <h2>Progress</h2>
            <p>Processed {progress.processedCount} out of {progress.totalAccounts} accounts.</p>
            {progress.status === 'completed' && <p>Job completed!</p>}
        </div>
    );
};

export default ProgressTrackerCapitalisation;
