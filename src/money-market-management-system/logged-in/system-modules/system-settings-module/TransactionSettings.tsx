import React, { useState, useEffect } from 'react';
import { ISetting, IWithdrawalSetting, defaultWithdrawalSettings } from '../../../../shared/models/WithdrawalSettings';
import { useAppContext } from '../../../../shared/functions/Context';

const TransactionSettings: React.FC = () => {
    const [withdrawalSettings, setWithdrawalSettings] = useState<IWithdrawalSetting>({ ...defaultWithdrawalSettings });
    const { api, store } = useAppContext();

    // Load saved withdrawalSettings when component mounts
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await api.withdrawalSettings.getAll();
                if (settings) {
                    const withdrawalSettings = store.withdrawalSettings.getItemById("WithdrawalSettings");
                    if (withdrawalSettings) {
                        setWithdrawalSettings(withdrawalSettings.asJson);
                    }
                }
            } catch (error) {
            }
        };

        loadSettings();
    }, [api.withdrawalSettings, store.withdrawalSettings]);

    // Function to handle enabling/disabling a setting
    const handleEnableChange = (settingKey: keyof IWithdrawalSetting, enabled: boolean) => {
        setWithdrawalSettings(prevSettings => ({
            ...prevSettings,
            [settingKey]: {
                ...(prevSettings[settingKey] as ISetting),
                enabled: enabled
            }
        }));
    };

    // Function to handle value change for a setting
    const handleValueChange = (settingKey: keyof IWithdrawalSetting, value: string | number | null) => {
        setWithdrawalSettings(prevSettings => ({
            ...prevSettings,
            [settingKey]: {
                ...(prevSettings[settingKey] as ISetting),
                value
            }
        }));
    };

    // Function to save withdrawalSettings
    const saveSettings = async () => {
        try {
            await api.withdrawalSettings.create(withdrawalSettings);
        } catch (error) {
        }
    };

    return (
        <div className="uk-grid uk-child-width-1-2" data-uk-grid>
            <div className='uk-margin-top'>
                <h4 className='main-title-md'>Withdrawal Settings</h4>

                <table className='uk-table uk-table-small uk-table-divider'>
                    <thead>
                        <tr>
                            <th>Setting</th>
                            <th>Option</th>
                            <th>Current Setting (Value)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='uk-width-large'>Withdrawal Threshold Limit</td>
                            <td className='uk-width-small'>
                                <label className='uk-form-label uk-display-block'>
                                    <input
                                        className='uk-radio'
                                        type="radio"
                                        name="withdrawalThreshold"
                                        checked={withdrawalSettings.withdrawalThreshold.enabled}
                                        onChange={() => handleEnableChange('withdrawalThreshold', true)}
                                    />
                                    {" "} Enable
                                </label>
                                <label className='uk-display-block'>
                                    <input
                                        className='uk-radio'
                                        type="radio"
                                        name="withdrawalThreshold"
                                        checked={!withdrawalSettings.withdrawalThreshold.enabled}
                                        onChange={() => handleEnableChange('withdrawalThreshold', false)}
                                    />
                                    {" "} Disable
                                </label>
                            </td>
                            <td className='uk-width-large'>
                                {
                                    withdrawalSettings.withdrawalThreshold.enabled &&
                                    <input type="text"
                                        value={(withdrawalSettings.withdrawalThreshold.value)?.toString()}
                                        onChange={(e) => handleValueChange('withdrawalThreshold', e.target.value)}
                                    />
                                }

                            </td>
                        </tr>
                        <tr>
                            <td>Monthly Client Withdrawal Frequency Limit</td>
                            <td>
                                <label className='uk-display-block'>
                                    <input
                                        className='uk-radio'
                                        type="radio"
                                        name="monthlyClientWithdrawalCountLimit"
                                        checked={withdrawalSettings.monthlyClientWithdrawalCountLimit.enabled}
                                        onChange={() => handleEnableChange('monthlyClientWithdrawalCountLimit', true)}
                                    />
                                    {" "} Enable
                                </label>
                                <label className='uk-display-block'>
                                    <input
                                        className='uk-radio'
                                        type="radio"
                                        name="monthlyClientWithdrawalCountLimit"
                                        checked={!withdrawalSettings.monthlyClientWithdrawalCountLimit.enabled}
                                        onChange={() => handleEnableChange('monthlyClientWithdrawalCountLimit', false)}
                                    />
                                    {" "} Disable
                                </label>
                            </td>
                            <td>
                                {withdrawalSettings.monthlyClientWithdrawalCountLimit.enabled && (
                                    <input type="text"
                                        value={withdrawalSettings.monthlyClientWithdrawalCountLimit.value?.toString()}
                                        onChange={(e) => handleValueChange('monthlyClientWithdrawalCountLimit', e.target.value)}
                                    />
                                )}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3}>
                                <button className='btn btn-primary' onClick={saveSettings}>Update Settings</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default TransactionSettings;
