#pragma once

#include <cstdint>

#include "ReplayLinkAPI.h"

namespace replay
{
    struct REPLAYLINK_API vector2
	{ 
		vector2(float a_x, float a_y) 
			: x(a_x), y(a_y)
		{
		}

		float x; float y; 
	};

	bool connect_to_league();

    class REPLAYLINK_API camera
	{
	public:
		camera() { }
		virtual ~camera() { }

		virtual bool init() = 0;

		virtual vector2 get_position() = 0;
		virtual void set_position(float x, float y) = 0;
	};

    class REPLAYLINK_API camera_impl : public camera
	{
	public:
		camera_impl();
		~camera_impl() { }

		bool init() override;

		vector2 get_position() override;
		void set_position(float x, float y) override;
		void set_position(vector2 vec);

	private:
		uint32_t object_address;
	};

    class REPLAYLINK_API controls
	{
	public:
		controls() { }
		virtual ~controls() { }

		virtual bool init() = 0;

		virtual void set_time(float time) = 0;
		virtual float get_time() = 0;

	};

	class REPLAYLINK_API controls_impl : public controls
	{
	public: 
		controls_impl();
		~controls_impl() { }

		bool init() override;
		void set_time(float time) override;
		float get_time() override;

	private:
		uint32_t object_address = 0;
		uint32_t set_time_address = 0;
		uint32_t time_address = 0;
	};
};