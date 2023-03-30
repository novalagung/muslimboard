package common

import "encoding/json"

func ConvertToJson(src interface{}) string {
	buf, _ := json.Marshal(src)
	return string(buf)
}

func ConvertToMap(src string) (map[string]interface{}, error) {
	res := make(map[string]interface{})
	err := json.Unmarshal([]byte(src), &res)
	return res, err
}
