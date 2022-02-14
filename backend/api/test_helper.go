package api

import (
	"uzume_backend/model"
	"uzume_backend/test_helper"
)

func InitializeTest() {
	test_helper.InitializeTest()
	model.ResetImageCache()
}
