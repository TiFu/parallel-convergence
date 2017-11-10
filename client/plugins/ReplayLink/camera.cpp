#include "replaylink.h"
#include "league.h"

#include <iostream>
#include <chrono>
#include <thread>

#include <../Patterns/PatternSearch.h>
#include <../Process/Process.h>

using namespace blackbone;
using namespace std::chrono_literals;

namespace replay
{
	camera_impl::camera_impl()
	{
	}

	bool camera_impl::init()
	{
		if (connect_to_league() == false)
			return false;

		// std::cout << "Trying to find the pattern for the camera object..." << std::endl;

		object_address = 0;
		PatternSearch pattern("\x8B\x0D\xCC\xCC\xCC\xCC\x8B\x49\x24\xE8\xCC\xCC\xCC\xCC\x8B");

		std::vector<ptr_t> results;
		pattern.SearchRemoteWhole(internal::league_process, true, 0xCC, results);

		// Unable to find position offset
		if (results.size() == 0)
		{
			// std::cout << "Unable to find the pattern." << std::endl;
			return false;
		}

		if (internal::league_process.memory().Read<uint32_t>(results[0] + 2, object_address))
		{
			// std::cout << "Failed to read a part of the pattern." << std::endl;
			return false;
		}

		if (internal::league_process.memory().Read<uint32_t>(object_address, object_address))
		{
			// std::cout << "Failed to read in the multiplayer client." << std::endl;
			return false;
		}

		if (internal::league_process.memory().Read<uint32_t>(object_address + 12, object_address))
		{
			// std::cout << "Failed to get the camera object." << std::endl;
			return false;
		}

		return true;
	}

	vector2 camera_impl::get_position()
	{
		vector2 t_result(0, 0);
		if (internal::league_process.memory().Read<float>(object_address + 0x12c, t_result.x))
		{
			// std::cout << "Failed to read x position of camera." << std::endl;
			return vector2(-2, -2);
		}

		if (internal::league_process.memory().Read<float>(object_address + 0x134, t_result.y))
		{
			// std::cout << "Failed to read y position of camera." << std::endl;
			return vector2(-3, -3);
		}

		return t_result;
	}

	void camera_impl::set_position(float x, float y)
	{
		if (internal::league_process.memory().Write<float>(object_address + 0x12c, x))
		{
			// std::cout << "Failed to write x position of camera." << std::endl;
			return;
		}

		if (internal::league_process.memory().Write<float>(object_address + 0x134, y))
		{
			// std::cout << "Failed to write y position of camera." << std::endl;
			return;
		}
	}

	void camera_impl::set_position(vector2 vec)
	{
		return set_position(vec.x, vec.y);
	}
}
