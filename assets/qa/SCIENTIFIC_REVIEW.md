# 科學依據與證據邊界 — V10.207

## 已有合理依據的數學量
- RMSSD 是相鄰有效NN間隔差的平方平均根，SDNN 是NN間隔的樣本標準差（n−1）；不可用平均心率合成逐搏間隔，不能跨越已知缺測區間拼接。獨立例：常數800 ms的理想NN序列二者為0；700/900 ms交替序列RMSSD為200 ms。這是數學驗算，不是病理判讀。
- 20 Hz 的採樣間隔50 ms。`independent-signal-check.cjs` 以固定真實IBI 803 ms及最近格點量化研究20/50/100/255 Hz，得到人工RMSSD 17.342/10.968/7.756/2.692 ms。這些是理想量化例，不代表裝置的真實誤差、不是可直接扣除的校正係數；插值不等於取得真實高頻樣本。
- RER = 70 × kg^0.75 kcal/day，對現行程式進行363個數學/輸入邊界案例。MER係數只是初始估算，需實際體態、絕育狀態、活動、成長與獸醫校準，並非個別處方。

## 文獻支持與限制
1. Rishniw 等，Sleeping respiratory rates in apparently healthy adult dogs, 2012，https://pubmed.ncbi.nlm.nih.gov/22240295/ 。支持休息/睡眠呼吸與活動情境分開解讀，不證明本APP的四級分數或警報閾值。
2. Cats sleeping/resting respiratory rates，https://journals.sagepub.com/doi/full/10.1177/1098612x13508940 。支持犬貓及量測情境差異；不支持將所有犬貓硬套同一呼吸範圍。
3. ECG sampling rate and HRV，https://pmc.ncbi.nlm.nih.gov/articles/PMC6085204/ 。採樣率對HRV的重要性；人類ECG研究不可直接當作犬貓20Hz BCG臨床驗證。
4. Veterinary HRV review，https://pmc.ncbi.nlm.nih.gov/articles/PMC9179192/ 。HRV受自主神經、個體、情境及量測品質影響；高值不必然健康，尤其當異常心搏、偵測錯誤或動作干擾存在。
5. Canine sleep/polysomnography，https://pmc.ncbi.nlm.nih.gov/articles/PMC12427222/ 及 https://pmc.ncbi.nlm.nih.gov/articles/PMC7341213/ 。睡眠分期的獨立參考是多導睡眠量測。BCG、呼吸與活動推定的淺深睡、REM必須是估算，現行資料 `sleepStagesVerified:false` 保留。
6. Merck Veterinary Manual, Nutritional Requirements of Small Animals，https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-of-small-animals 。RER公式參考；AAHA營養管理指引 https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/weight-reduction-in-the-obese-pet/0/ 。不能單靠體重精確預測個體每日所需熱量。

## 未獲獨立臨床驗證
0–100分權重、群體參考與品種係數、風險分級、14天的最佳基準長度、120秒恢復的風險對應、AI健康年齡、應急提醒的臨床敏感度/特異度、實際HRV精度及BCG睡眠分期。不得以展示資料或公式一致性驗證宣稱臨床精度。現有長期模型沒有將體檢分數直接當作已驗證的校正係數；本輪保留其防護而不臆造校準。需收集同步ECG/呼吸參考、姿勢與活動、睡眠PSG或獸醫標註，建立獨立寵物分組的盲測，再選擇候選算法。所有公式權重保留，沒有以假設數值重算真實資料。
