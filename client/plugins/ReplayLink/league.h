#pragma once

#include <iostream>
#include <chrono>
#include <thread>

#include <../Patterns/PatternSearch.h>
#include <../Process/Process.h>

#define PROCESS_NAME L"League of Legends.exe"

using namespace blackbone;
using namespace std::chrono_literals;

namespace replay
{
	namespace internal
	{
		extern Process league_process;
		extern bool attached;
	}
}