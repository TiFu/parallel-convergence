#pragma once

#ifdef BUILD_REPLAYLINK
#define REPLAYLINK_API __declspec(dllexport)
#else
#define REPLAYLINK_API __declspec(dllimport)
#endif
